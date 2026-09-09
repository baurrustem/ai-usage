from __future__ import annotations

import asyncio
import json
import os
import signal
import sys
from datetime import date

from .common import ProviderError, classify_error, number, percent, timestamp


def normalize_reset_credits(raw) -> dict | None:
    if not isinstance(raw, dict):
        return None
    count = number(raw.get("availableCount"), integer=True)
    if count is None:
        return None
    # Detail rows can be capped by the service; availableCount is authoritative.
    rows = raw.get("credits")
    expiries = [timestamp(row.get("expiresAt")) for row in (rows if isinstance(rows, list) else [])
                if isinstance(row, dict) and row.get("status") == "available"]
    return {"availableCount": count, "nextExpiresAt": min(filter(None, expiries), default=None) if count else None}


def normalize_codex(result: dict, fetched_at: str) -> dict:
    groups = result.get("rateLimitsByLimitId")
    if not isinstance(groups, dict) or not groups:
        legacy = result.get("rateLimits")
        groups = {str(legacy.get("limitId") or "codex"): legacy} if isinstance(legacy, dict) else {}
    limits = []
    for group_id, group in sorted(groups.items(), key=lambda item: (item[0] != "codex", item[0])):
        if not isinstance(group, dict):
            continue
        for slot in ("primary", "secondary"):
            window = group.get(slot)
            if not isinstance(window, dict):
                continue
            limits.append({
                "id": f"{group_id}:{slot}", "groupId": group_id,
                "groupName": group.get("limitName") or ("Codex" if group_id == "codex" else group_id),
                "slot": slot, "title": "Основной" if slot == "primary" else "Дополнительный",
                "windowMinutes": number(window.get("windowDurationMins")),
                "usedPercent": percent(window.get("usedPercent")),
                "resetsAt": timestamp(window.get("resetsAt")), "resetDescription": None,
            })
    if not any(x["usedPercent"] is not None for x in limits):
        raise ProviderError("unavailable")
    return {"source": "codex-app-server", "fetchedAt": fetched_at, "limits": limits,
            "resetCredits": normalize_reset_credits(result.get("rateLimitResetCredits"))}


def select_payload(raw, provider: str) -> dict:
    values = raw if isinstance(raw, list) else [raw]
    matches = [x for x in values if isinstance(x, dict) and x.get("provider") == provider]
    if len(matches) != 1:
        raise ProviderError("invalid_data")
    payload = matches[0]
    if payload.get("error"):
        raise classify_error(json.dumps(payload["error"]))
    return payload


def normalize_claude(raw, fetched_at: str) -> dict:
    payload = select_payload(raw, "claude")
    usage = payload.get("usage")
    if not isinstance(usage, dict):
        raise ProviderError("unavailable")
    limits = []
    for slot, title in (("primary", "Сессия"), ("secondary", "Неделя"), ("tertiary", "Отдельный лимит")):
        window = usage.get(slot)
        if not isinstance(window, dict):
            continue
        limits.append({
            "id": f"claude:{slot}", "groupId": "claude", "groupName": "Claude",
            "slot": slot, "title": window.get("label") or title,
            "windowMinutes": number(window.get("windowMinutes")),
            "usedPercent": percent(window.get("usedPercent")),
            "resetsAt": timestamp(window.get("resetsAt")),
            "resetDescription": window.get("resetDescription") if isinstance(window.get("resetDescription"), str) else None,
        })
    # New CodexBar releases may expose additional named quota windows.
    for index, extra in enumerate(usage.get("extraRateWindows") or usage.get("additionalWindows") or []):
        if not isinstance(extra, dict):
            continue
        window = extra.get("window", extra)
        if not isinstance(window, dict):
            continue
        limits.append({
            "id": str(extra.get("id") or f"claude:extra-{index}"), "groupId": "claude", "groupName": "Claude",
            "slot": "extra", "title": extra.get("label") or extra.get("title") or "Дополнительный",
            "windowMinutes": number(window.get("windowMinutes")),
            "usedPercent": percent(window.get("usedPercent")), "resetsAt": timestamp(window.get("resetsAt")),
            "resetDescription": window.get("resetDescription") if isinstance(window.get("resetDescription"), str) else None,
        })
    if not any(x["usedPercent"] is not None for x in limits):
        raise ProviderError("unavailable")
    return {"source": "claude-cli-via-codexbar", "fetchedAt": timestamp(usage.get("updatedAt")) or fetched_at, "limits": limits}


def normalize_tokens(raw, provider: str, fetched_at: str) -> dict:
    payload = select_payload(raw, provider)
    daily = payload.get("daily")
    if not isinstance(daily, list):
        raise ProviderError("unavailable")
    days = {}
    for row in daily:
        if not isinstance(row, dict):
            continue
        try:
            day = date.fromisoformat(row.get("date", "")).isoformat()
        except (TypeError, ValueError):
            continue
        total = number(row.get("totalTokens"), integer=True)
        if total is None:
            continue
        days[day] = {"date": day, **{key: number(row.get(key), integer=True) for key in (
            "totalTokens", "inputTokens", "outputTokens", "cacheReadTokens", "cacheCreationTokens")}}
    return {"source": "codexbar-cost", "coverage": "local", "fetchedAt": timestamp(payload.get("updatedAt")) or fetched_at,
            "daily": sorted(days.values(), key=lambda x: x["date"])}


async def stop_process(process):
    if process.returncode is None:
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            await asyncio.wait_for(process.wait(), 2)
        except asyncio.TimeoutError:
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            await process.wait()


async def run_json(args: list[str], *, timeout: float, env: dict | None = None):
    try:
        process = await asyncio.create_subprocess_exec(*args, stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE, env=env, start_new_session=True, limit=16 * 1024 * 1024)
    except (FileNotFoundError, PermissionError):
        raise ProviderError("missing_tool") from None
    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout)
        if process.returncode:
            raise classify_error((stdout + stderr).decode(errors="replace"))
        try:
            return json.loads(stdout)
        except (ValueError, UnicodeError):
            raise ProviderError("invalid_data") from None
    except asyncio.TimeoutError:
        raise ProviderError("timeout") from None
    finally:
        await stop_process(process)


async def fetch_codex(executable: str, fetched_at: str, env: dict) -> dict:
    try:
        process = await asyncio.create_subprocess_exec(executable, "app-server", "-c", "analytics.enabled=false",
            stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.DEVNULL,
            start_new_session=True, env=env, limit=2 * 1024 * 1024)
    except (FileNotFoundError, PermissionError):
        raise ProviderError("missing_tool") from None

    async def send(value):
        process.stdin.write((json.dumps(value) + "\n").encode())
        await process.stdin.drain()

    async def response(request_id):
        while True:
            line = await process.stdout.readline()
            if not line:
                raise ProviderError("process_failed")
            try:
                obj = json.loads(line)
            except (ValueError, UnicodeError):
                raise ProviderError("invalid_data") from None
            if obj.get("id") == request_id:
                if obj.get("error"):
                    raise classify_error(json.dumps(obj["error"]))
                if not isinstance(obj.get("result"), dict):
                    raise ProviderError("invalid_data")
                return obj["result"]

    async def request():
        await send({"id": 1, "method": "initialize", "params": {"clientInfo": {"name": "ai_usage_widget", "version": "1.0.0"}}})
        await response(1)
        await send({"method": "initialized"})
        await send({"id": 2, "method": "account/rateLimits/read"})
        return normalize_codex(await response(2), fetched_at)

    try:
        return await asyncio.wait_for(request(), timeout=25)
    except asyncio.TimeoutError:
        raise ProviderError("timeout") from None
    except (BrokenPipeError, ConnectionError):
        raise ProviderError("process_failed") from None
    finally:
        await stop_process(process)


async def fetch_claude(executable: str, fetched_at: str, env: dict) -> dict:
    # CodexBar performs its own 24s/60s retries and a /status probe. Let those finish.
    raw = await run_json([executable, "usage", "--provider", "claude", "--source", "cli", "--format", "json", "--json-only"], timeout=140, env=env)
    return normalize_claude(raw, fetched_at)


async def fetch_tokens(executable: str, provider: str, fetched_at: str, env: dict) -> dict:
    raw = await run_json([executable, "cost", "--provider", provider, "--days", "30", "--format", "json", "--json-only"], timeout=55, env=env)
    return normalize_tokens(raw, provider, fetched_at)


async def fetch_activity(provider: str, env: dict) -> dict:
    data = await run_json([sys.executable, "-m", "ai_usage.activity", "--provider", provider,
                          "--time-zone", env["TZ"]], timeout=60, env=env)
    if data.get("error"):
        raise ProviderError(data["error"])
    return data
