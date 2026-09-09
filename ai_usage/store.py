from __future__ import annotations

import json
import sqlite3
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

from .common import PROVIDERS, UTC, ProviderError, epoch, iso


def compact_history(rows: list[dict], now: str) -> list[dict]:
    """Keep extrema/endpoints; never bridge resets or missing observations."""
    current = epoch(now)
    output, bucket, bucket_key = [], [], None

    def flush():
        if not bucket:
            return
        chosen = {0, len(bucket) - 1,
                  min(range(len(bucket)), key=lambda i: bucket[i]["usedPercent"]),
                  max(range(len(bucket)), key=lambda i: bucket[i]["usedPercent"])}
        output.extend(bucket[i] for i in sorted(chosen))
        bucket.clear()

    previous = None
    for row in rows:
        point = {"at": row["at"], "usedPercent": row["used"], "resetsAt": row["reset_at"], "breakBefore": False}
        at = epoch(point["at"])
        age = current - at
        width = 300 if age <= 86400 else (3600 if age <= 7 * 86400 else 21600)
        boundary = previous is None or at - epoch(previous["at"]) > 900 or (
            point["resetsAt"] != previous["resetsAt"] or point["usedPercent"] < previous["usedPercent"])
        key = (width, int(at // width))
        if boundary or key != bucket_key:
            flush()
        point["breakBefore"] = boundary
        bucket.append(point)
        bucket_key = key
        previous = point
    flush()
    return output


class Store:
    def __init__(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(path)
        self.db.row_factory = sqlite3.Row
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.executescript("""
            CREATE TABLE IF NOT EXISTS source_state (
                provider TEXT NOT NULL, kind TEXT NOT NULL, attempted_at TEXT NOT NULL,
                status TEXT NOT NULL, error_code TEXT, payload TEXT,
                PRIMARY KEY (provider, kind)
            );
            CREATE TABLE IF NOT EXISTS quota_points (
                provider TEXT NOT NULL, limit_id TEXT NOT NULL, at TEXT NOT NULL,
                used REAL NOT NULL, reset_at TEXT,
                PRIMARY KEY (provider, limit_id, at)
            );
            CREATE TABLE IF NOT EXISTS token_days (
                provider TEXT NOT NULL, day TEXT NOT NULL, payload TEXT NOT NULL,
                PRIMARY KEY (provider, day)
            );
            CREATE TABLE IF NOT EXISTS activity_days (
                provider TEXT NOT NULL, day TEXT NOT NULL, payload TEXT NOT NULL,
                PRIMARY KEY (provider, day)
            );
            PRAGMA user_version=1;
        """)

    def close(self):
        self.db.close()

    def success(self, provider: str, kind: str, data: dict, attempted_at: str):
        with self.db:
            self.db.execute("""INSERT INTO source_state VALUES (?,?,?,'ok',NULL,?)
                ON CONFLICT(provider,kind) DO UPDATE SET attempted_at=excluded.attempted_at,
                status='ok',error_code=NULL,payload=excluded.payload""",
                (provider, kind, attempted_at, json.dumps(data)))
            if kind == "limits":
                for window in data["limits"]:
                    if window["usedPercent"] is not None:
                        self.db.execute("INSERT OR REPLACE INTO quota_points VALUES (?,?,?,?,?)",
                            (provider, window["id"], data["fetchedAt"], window["usedPercent"], window["resetsAt"]))
            elif kind == "tokens":
                for day in data["daily"]:
                    self.db.execute("INSERT OR REPLACE INTO token_days VALUES (?,?,?)",
                        (provider, day["date"], json.dumps(day)))
            elif kind == "activity":
                for day in data["daily"]:
                    self.db.execute("INSERT OR REPLACE INTO activity_days VALUES (?,?,?)",
                        (provider, day["date"], json.dumps(day)))

    def failure(self, provider: str, kind: str, error: ProviderError, attempted_at: str):
        with self.db:
            self.db.execute("""INSERT INTO source_state VALUES (?,?,?,'error',?,NULL)
                ON CONFLICT(provider,kind) DO UPDATE SET attempted_at=excluded.attempted_at,
                status='error',error_code=excluded.error_code""", (provider, kind, attempted_at, error.code))

    def prune(self, now: str, retention_days: int = 90):
        cutoff = iso(datetime.fromtimestamp(epoch(now), UTC) - timedelta(days=retention_days))
        with self.db:
            self.db.execute("DELETE FROM quota_points WHERE at < ?", (cutoff,))
            self.db.execute("DELETE FROM token_days WHERE day < ?", (cutoff[:10],))
            self.db.execute("DELETE FROM activity_days WHERE day < ?", (cutoff[:10],))

    def snapshot(self, now: str, time_zone: str, enabled=None, display=None, language="en") -> dict:
        providers = []
        cutoff = iso(datetime.fromtimestamp(epoch(now), UTC) - timedelta(days=30))
        for provider, name in PROVIDERS.items():
            if enabled is not None and provider not in enabled:
                continue
            item = {"id": provider, "name": name, "limits": [], "limitHistory": [], "tokens": {"coverage": "local", "daily": []}}
            if display and provider in display:
                item["display"] = display[provider]
            for kind in ("limits", "tokens", "activity"):
                row = self.db.execute("SELECT * FROM source_state WHERE provider=? AND kind=?", (provider, kind)).fetchone()
                data = json.loads(row["payload"]) if row and row["payload"] else {}
                state = {"state": row["status"] if row else "unavailable", "attemptedAt": row["attempted_at"] if row else None,
                         "fetchedAt": data.get("fetchedAt"), "source": data.get("source"), "code": row["error_code"] if row else "unavailable"}
                state["message"] = str(ProviderError(state["code"])) if state["code"] else None
                if kind == "limits":
                    item["limitsState"] = state
                    item["limits"] = data.get("limits", [])
                    if provider == "codex":
                        item["resetCredits"] = data.get("resetCredits")
                elif kind == "tokens":
                    item["tokens"]["state"] = state
                    item["tokens"]["daily"] = [json.loads(x["payload"]) for x in self.db.execute(
                        "SELECT payload FROM token_days WHERE provider=? AND day>=? ORDER BY day", (provider, cutoff[:10]))]
                else:
                    item["activity"] = {"coverage": "local", "state": state, "daily": [json.loads(x["payload"]) for x in self.db.execute(
                        "SELECT payload FROM activity_days WHERE provider=? AND day>=? ORDER BY day", (provider, cutoff[:10]))]}
            by_limit = defaultdict(list)
            for row in self.db.execute("SELECT * FROM quota_points WHERE provider=? AND at>=? ORDER BY at", (provider, cutoff)):
                by_limit[row["limit_id"]].append(dict(row))
            item["limitHistory"] = [{"id": key, "points": compact_history(rows, now)} for key, rows in by_limit.items()]
            providers.append(item)
        return {"schemaVersion": 1, "generatedAt": now, "timeZone": time_zone, "language": language, "retentionDays": 90,
                "staleAfterSeconds": 900, "providers": providers}
