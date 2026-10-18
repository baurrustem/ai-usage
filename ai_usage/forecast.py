"""Pace forecast for a quota window: at the pace of the last hour, will it run out before the reset?

The forecast is a straight line through the readings of the last hour. It is deliberately simple:
no model of daily habits. That is only honest for the next few hours of work, so a run-out further
than HORIZON away is not reported. It says nothing when the last hour has too little data.
"""
from __future__ import annotations

from datetime import datetime

from .common import UTC, epoch, iso

RESET_JITTER = 600      # providers report the same reset a minute apart; treat them as one window
MAX_GAP = 3600          # a hole longer than this (Mac asleep, source failing) starts a new run of readings
LOOKBACK = 3600         # pace = change over the last hour
MIN_SPAN = 900          # need at least 15 minutes of readings to call a pace
HORIZON = 6 * 3600      # beyond a working session a straight line says more about breaks than about usage


def same_reset(a: str | None, b: str | None) -> bool:
    if not a or not b:
        return a == b
    return abs(epoch(a) - epoch(b)) <= RESET_JITTER


def current_run(rows: list[dict], resets_at: str | None) -> list[tuple[float, float]]:
    """Trailing readings of the current window: same reset, no drop in usage, no long gap."""
    run: list[tuple[float, float]] = []
    for row in reversed(rows):
        if not same_reset(row["reset_at"], resets_at):
            break
        at, used = epoch(row["at"]), float(row["used"])
        if run and (run[0][0] - at > MAX_GAP or used > run[0][1] + 0.5):
            break
        run.insert(0, (at, used))
    return run


def forecast(rows: list[dict], window: dict, now: str) -> dict | None:
    """rows: quota_points of this limit ordered by time ({at, used, reset_at})."""
    resets_at, used_now = window.get("resetsAt"), window.get("usedPercent")
    if not resets_at or used_now is None:
        return None
    current, reset = epoch(now), epoch(resets_at)
    if reset <= current:
        return None
    run = [(at, used) for at, used in current_run(rows, resets_at) if at <= current]
    recent = [(at, used) for at, used in run if at >= current - LOOKBACK]
    if len(recent) < 2 or recent[-1][0] - recent[0][0] < MIN_SPAN:
        return None
    (t0, u0), (t1, u1) = recent[0], recent[-1]
    rate = max(0.0, (u1 - u0) / (t1 - t0))
    at_reset = min(100.0, u1 + rate * (reset - t1))
    exhausts = None
    if reset - current > HORIZON and not (rate > 0 and at_reset >= 100):
        return None                 # "lasts until a reset days away" is not a claim one hour of work supports
    if rate > 0 and at_reset >= 100:
        runs_out = t1 + (100 - u1) / rate
        if runs_out - current > HORIZON:
            return None             # too far to call from one hour of work
        exhausts = iso(datetime.fromtimestamp(runs_out, UTC))
    return {"basis": "last_hour", "ratePerHour": round(rate * 3600, 2),
            "atResetPercent": round(at_reset), "exhaustsAt": exhausts}
