# Changelog

## 1.0.0 — initial community preview

- macOS collector for Claude Code and Codex account quotas, reset times and supported Codex reset-credit counts.
- Local token breakdowns, human prompt/session activity, quota history and offline snapshot cache.
- Scriptable home-screen/lock-screen widgets and English/Russian detail interfaces, with centered typography and light/dark themes.
- English/Russian widgets, localized source states and dates, a synchronized language setting and per-widget language overrides.
- Configurable services, time zone, executable/iCloud paths, hidden limits and optional pinned windows; neutral defaults for new installations.
- Existing pre-public preferences preserved on upgrade; no-start installation avoids changing a running LaunchAgent.
- English/Russian setup documentation, synthetic previews, private-file preflight, deterministic source archive and checksum generation.

Limitations: Claude usage parsing depends on CodexBar CLI 0.56.7; iCloud/iOS control delivery; activity/tokens cover local logs only; no multi-account support or other APIs yet.
