"""Replay the pace forecast over your own local history and print aggregate accuracy.

Reads the collector database read-only and prints counts only: no timestamps, prompts or paths.
Usage: python3 tools/backtest_forecast.py [path/to/usage.sqlite3]
"""
from __future__ import annotations

import json
import sqlite3
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from ai_usage.common import epoch  # noqa: E402
from ai_usage.forecast import MAX_GAP, forecast, same_reset  # noqa: E402

DEFAULT = Path.home() / "Library/Application Support/AI Usage/usage.sqlite3"
FULL = 99.5


def windows(rows):
    """Split readings of one limit into windows: same reset, no drop, no long gap."""
    out, cur = [], []
    for row in rows:
        if not row["reset_at"]:
            continue
        if cur and (not same_reset(row["reset_at"], cur[-1]["reset_at"]) or row["used"] < cur[-1]["used"] - 0.5
                    or epoch(row["at"]) - epoch(cur[-1]["at"]) > MAX_GAP):
            out.append(cur)
            cur = []
        cur.append(row)
    return out + ([cur] if cur else [])


def replay(rows, limit_id="", window_minutes=None):
    window_minutes = window_minutes or {}
    result = {"windows_used": 0, "windows_full": 0, "warned": 0, "missed": 0, "false_alarms": 0, "quiet_ok": 0,
              "errors_min": [], "lead_min": [], "waited_h": []}
    split = windows(rows)
    for index, win in enumerate(split):
        if max(r["used"] for r in win) <= 0:
            continue
        result["windows_used"] += 1
        reset = win[-1]["reset_at"]
        full = next((r for r in win if r["used"] >= FULL), None)
        if full:
            result["windows_full"] += 1
            # Quota is back at the reset, or earlier if a new window starts (for example a reset credit).
            back = epoch(reset)
            if index + 1 < len(split):
                back = min(back, epoch(split[index + 1][0]["at"]))
            result["waited_h"].append(max(0.0, back - epoch(full["at"])) / 3600)
        elif epoch(reset) - epoch(win[-1]["at"]) > 1800:
            continue                       # window not observed to the end: outcome unknown
        first_warning = None
        for i, row in enumerate(win):
            if row["used"] >= FULL:
                break
            minutes = window_minutes.get(limit_id) or (300 if epoch(reset) - epoch(win[0]["at"]) <= 6 * 3600 else 10080)
            pace = forecast(win[:i + 1], {"resetsAt": reset, "usedPercent": row["used"], "windowMinutes": minutes}, row["at"])
            if not pace:
                continue
            warns = pace["exhaustsAt"] is not None
            if warns and full:
                result["warned"] += 1
                result["errors_min"].append(abs(epoch(pace["exhaustsAt"]) - epoch(full["at"])) / 60)
                first_warning = first_warning or row
            elif warns:
                result["false_alarms"] += 1
            elif full:
                result["missed"] += 1
            else:
                result["quiet_ok"] += 1
        if full and first_warning:
            result["lead_min"].append((epoch(full["at"]) - epoch(first_warning["at"])) / 60)
    summary = {k: v for k, v in result.items() if not isinstance(v, list)}
    for key in ("errors_min", "lead_min", "waited_h"):
        values = result[key]
        summary[key.replace("_min", "_median_min").replace("_h", "_total_h")] = (
            round(sum(values), 1) if key == "waited_h" else (round(statistics.median(values)) if values else None))
    return summary


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT
    db = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    db.row_factory = sqlite3.Row
    report = {}
    # Window lengths from the last stored limits payload, when available.
    minutes = {}
    for (payload,) in db.execute("SELECT payload FROM source_state WHERE kind='limits' AND payload IS NOT NULL"):
        for w in json.loads(payload).get("limits", []):
            if w.get("windowMinutes"):
                minutes[w["id"]] = w["windowMinutes"]
    for (limit_id,) in db.execute("SELECT DISTINCT limit_id FROM quota_points ORDER BY limit_id"):
        rows = [dict(r) for r in db.execute("SELECT at, used, reset_at FROM quota_points WHERE limit_id=? ORDER BY at", (limit_id,))]
        report[limit_id] = replay(rows, limit_id, minutes)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
