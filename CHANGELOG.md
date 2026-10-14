# Changelog

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
