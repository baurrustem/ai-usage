"""Count human prompts from local transcripts; never export their contents."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from .common import ProviderError, now_iso


def log_roots(provider: str) -> list[Path]:
    home = Path.home()
    if provider == "codex":
        base = Path(os.environ.get("CODEX_HOME", str(home / ".codex")))
        return [base / "sessions", base / "archived_sessions"]
    configured = os.environ.get("CLAUDE_CONFIG_DIR")
    roots = ([Path(p.strip()).expanduser() / "projects" for p in configured.split(",") if p.strip()]
             if configured else [home / ".claude/projects", home / ".config/claude/projects"])
    for directory in ("local-agent-mode-sessions", "claude-code-sessions"):
        roots.extend((home / "Library/Application Support/Claude" / directory).glob("**/.claude/projects"))
    return roots


def anonymous_id(provider: str, value: str) -> str:
    return hashlib.sha256((provider + "\0" + value).encode()).hexdigest()[:24]


def records(path: Path):
    with path.open(encoding="utf-8") as stream:
        for line in stream:
            if not line.endswith("\n"):
                break  # The active process may still be writing this record.
            try:
                record = json.loads(line)
            except ValueError:
                raise ProviderError("invalid_data") from None
            if isinstance(record, dict):
                yield record


def human_claude_prompt(record: dict) -> bool:
    if record.get("type") != "user" or any(record.get(key) for key in
            ("isSidechain", "isMeta", "isCompactSummary", "isVisibleInTranscriptOnly")):
        return False
    origin = record.get("origin")
    if isinstance(origin, dict) and origin.get("kind") not in (None, "human"):
        return False
    message = record.get("message") or {}
    content = message.get("content")
    if isinstance(content, list):
        # Tool results are also logged as role=user, but are not human prompts.
        if any(isinstance(block, dict) and block.get("type") == "tool_result" for block in content):
            return False
        if not any(isinstance(block, dict) and block.get("type") in ("text", "image", "document") for block in content):
            return False
        text = "".join(block.get("text", "") for block in content if isinstance(block, dict) and block.get("type") == "text")
    elif isinstance(content, str) and content.strip():
        text = content
    else:
        return False
    return not text.lstrip().startswith(("[Request interrupted", "<local-command-", "<command-name>",
                                         "<command-message>", "<system-reminder>"))


def claude_prompts(path: Path):
    if "subagents" in path.parts or "ClaudeProbe" in str(path):
        return
    for row in records(path):
        if human_claude_prompt(row):
            identity = row.get("promptId") or row.get("uuid")
            session = row.get("sessionId")
            if identity and session:
                yield str(identity), str(session), row.get("timestamp")


def codex_prompts(path: Path):
    session = None
    modern, legacy = [], []
    modern_turns, modern_signatures = set(), set()
    for row in records(path):
        payload = row.get("payload") or {}
        if not isinstance(payload, dict):
            continue
        if row.get("type") == "session_meta":
            source = payload.get("source")
            if source == "subagent" or isinstance(source, dict) and "subagent" in source:
                return
            session = payload.get("id") or payload.get("session_id")
        elif row.get("type") == "event_msg":
            item = payload.get("item") or {}
            if payload.get("type") == "item_completed" and item.get("type") == "UserMessage":
                identity = item.get("client_id") or item.get("id")
                if identity:
                    modern.append((str(identity), row.get("timestamp")))
                    if payload.get("turn_id"):
                        modern_turns.add(str(payload["turn_id"]))
                    content = item.get("content") or []
                    text = "".join(block.get("text", "") for block in content if isinstance(block, dict) and block.get("type") == "text")
                    modern_signatures.add(anonymous_id("codex-prompt", str(row.get("timestamp")) + "\0" + text))
            elif payload.get("type") == "user_message":
                identity = payload.get("id") or payload.get("turn_id")
                if not identity:
                    # Old CLI events have no ID. Same timestamp and text identify copies;
                    # hashing happens locally and the text never leaves this process.
                    identity = anonymous_id("codex-prompt", str(row.get("timestamp")) + "\0" + str(payload.get("message", "")))
                signature = anonymous_id("codex-prompt", str(row.get("timestamp")) + "\0" + str(payload.get("message", "")))
                legacy.append((str(identity), row.get("timestamp"), str(payload.get("turn_id", "")), signature))
    if session:
        for identity, at in modern:
            yield identity, str(session), at
        # A resumed transcript can span CLI versions. Retain older events, excluding
        # equivalent modern events by turn ID or exact timestamp/content signature.
        for identity, at, turn, signature in legacy:
            if turn not in modern_turns and signature not in modern_signatures:
                yield identity, str(session), at


def scan_activity(provider: str, roots: list[Path], fetched_at: str, time_zone: str, days: int = 30) -> dict:
    zone = ZoneInfo(time_zone)
    today = datetime.fromisoformat(fetched_at.replace("Z", "+00:00")).astimezone(zone).date()
    start = today - timedelta(days=days - 1)
    roots = list(dict.fromkeys(root.resolve() for root in roots if root.is_dir()))
    if not roots:
        raise ProviderError("unavailable")
    files = sorted({path.resolve() for root in roots for path in root.glob("**/*.jsonl")})
    if not files:
        raise ProviderError("unavailable")
    prompts = {}
    for path in files:
        for identity, session, at in (claude_prompts(path) if provider == "claude" else codex_prompts(path)):
            try:
                dt = datetime.fromisoformat(at.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    continue
                day = dt.astimezone(zone).date()
            except (AttributeError, ValueError, TypeError):
                continue
            if start <= day <= today:
                # Message IDs survive copied/replayed history and session resumption.
                prompts.setdefault(identity, (day.isoformat(), anonymous_id(provider, session)))
    daily = {(start + timedelta(days=i)).isoformat(): {"prompts": 0, "sessionIds": set()} for i in range(days)}
    for day, session in prompts.values():
        daily[day]["prompts"] += 1
        daily[day]["sessionIds"].add(session)
    return {"source": "local-session-logs", "coverage": "local", "fetchedAt": fetched_at,
            "daily": [{"date": day, "prompts": row["prompts"], "sessionIds": sorted(row["sessionIds"])}
                      for day, row in sorted(daily.items())]}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--provider", choices=("claude", "codex"), required=True)
    from .config import local_time_zone
    parser.add_argument("--time-zone", default=local_time_zone())
    args = parser.parse_args()
    try:
        data = scan_activity(args.provider, log_roots(args.provider), now_iso(), args.time_zone)
    except ProviderError as error:
        data = {"error": error.code}
    except (OSError, UnicodeError):
        data = {"error": "invalid_data"}
    print(json.dumps(data, separators=(",", ":")))


if __name__ == "__main__":
    main()
