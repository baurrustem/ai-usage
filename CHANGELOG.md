# Changelog

## 1.1.0 — 2026-10-18

- **Pace forecast.** Each limit gets a straight-line forecast from the readings of the last hour. If the limit would run out before its reset within the next 6 hours, the widget shows *runs out ~20:24* in amber and the detail screen explains it. Further run-outs are not reported: one hour of work says little about tomorrow.
- **iPhone notifications** (on by default; `configure --notifications off`):
  - *limit reset*, scheduled for the reset time when 80% or more of a limit is used;
  - *pace warning*, once per window, when the forecast says the limit runs out within 3 hours;
  - *limits are not updating*, when the Mac is sending data but a source has not answered for 6 hours, with the reason and `ai-usage doctor`;
  - *no data from the Mac*, after 24 hours without a snapshot.

  Each notification fires once. Notification failures never break the widget.
- **New design for the home-screen widgets.** Each service is a solid colour card (Claude clay, Codex pine). The limit most at risk leads with its remaining percent in large type, next to its verdict: *Runs out ~21:45* on amber, *Lasts until 22:25*, or *Renews Wed 20:35*. A time bar runs from now to the reset; the hatched part is the time left without quota. Other limits, reset credits and today's tokens sit in one line. Stale data turns the card graphite with a text label. The small, medium and large widgets share this layout. Lock-screen widgets are unchanged. The design system is recorded in DESIGN.md.
- **Fix:** providers can report the same reset a minute apart. History charts no longer break at that jitter.
- `tools/backtest_forecast.py` replays the forecast over your own local history and prints aggregate accuracy only.

Update by extracting the new ZIP and running `bash install.command` again. Settings and history are retained; notifications start after the widget or the script runs once.

## 1.0.1 — 2026-10-14

- Recover missing bundled Claude Code and Codex executables after application updates. Existing working and custom paths are preserved.
- Use the same executable resolution in diagnostics and collection. Authentication may still require a separate sign-in; this update does not bypass it.
- Simplify reset captions for Claude and the Codex five-hour window, preserving reset times and stale-data warnings.
- Include light/dark demo screenshots and updated troubleshooting guidance.

Update by extracting the new ZIP and running `bash install.command` again. Existing settings and history are retained. If Claude requires authentication, sign in with the CLI used by the collector, then run `collect`.

## 1.0.0 — initial community preview

- macOS collector for Claude Code and Codex account quotas, reset times and supported Codex reset-credit counts.
- Local token breakdowns, human prompt/session activity, quota history and offline snapshot cache.
- Scriptable home-screen/lock-screen widgets and English/Russian detail interfaces, with centered typography and light/dark themes.
- English/Russian widgets, localized source states and dates, a synchronized language setting and per-widget language overrides.
- Configurable services, time zone, executable/iCloud paths, hidden limits and optional pinned windows; neutral defaults for new installations.
- Existing pre-public preferences preserved on upgrade; no-start installation avoids changing a running LaunchAgent.
- English/Russian setup documentation, synthetic previews, private-file preflight, deterministic source archive and checksum generation.

Limitations: Claude usage parsing depends on CodexBar CLI 0.56.7; iCloud/iOS control delivery; activity/tokens cover local logs only; no multi-account support or other APIs yet.
