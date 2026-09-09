from __future__ import annotations

import json
import math
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

UTC = timezone.utc
PROVIDERS = {"claude": "Claude", "codex": "Codex"}


def now_iso() -> str:
    return iso(datetime.now(UTC))


def iso(value: datetime) -> str:
    return value.astimezone(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


def timestamp(value) -> str | None:
    try:
        if isinstance(value, bool) or value is None:
            return None
        if isinstance(value, (float, int)):
            return iso(datetime.fromtimestamp(value, UTC))
        date = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return iso(date) if date.tzinfo else None
    except (ValueError, TypeError, OverflowError, OSError):
        return None


def epoch(value: str) -> float:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()


def number(value, *, integer=False):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    if not math.isfinite(value) or value < 0 or (integer and value != int(value)):
        return None
    return int(value) if integer else value


def percent(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        return None
    return round(max(0.0, min(100.0, value)), 3)


def atomic_json(path: Path, data) -> None:
    atomic_write(path, json.dumps(data, ensure_ascii=False, separators=(",", ":"), allow_nan=False))


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".ai-usage-", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


class ProviderError(Exception):
    """Only a controlled code/message is logged or synchronized, never raw CLI output."""

    MESSAGES = {
        "missing_tool": "Tool not found on Mac",
        "timeout": "Source timed out",
        "loading": "Claude /usage is still loading limits",
        "auth": "Sign in again on Mac",
        "rate_limited": "Source rate limit reached",
        "invalid_data": "Could not read the source format",
        "unavailable": "No numeric readings returned",
        "process_failed": "Connection error on Mac",
        "unsupported_version": "CodexBar CLI 0.56.7 required",
        "cli_unavailable": "Claude CLI unavailable; check sign-in on Mac",
    }

    def __init__(self, code: str):
        self.code = code
        super().__init__(self.MESSAGES.get(code, "Source error"))


def classify_error(text: str) -> ProviderError:
    text = text.lower()
    if "still loading usage" in text:
        return ProviderError("loading")
    if "no available fetch strategy" in text:
        return ProviderError("cli_unavailable")
    if any(x in text for x in ("401", "unauthorized", "not logged", "login", "log in", "sign in", "expired", "authentication")):
        return ProviderError("auth")
    if "429" in text or "too many requests" in text:
        return ProviderError("rate_limited")
    return ProviderError("process_failed")
