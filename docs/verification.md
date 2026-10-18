# Release preparation verification

## Pace forecast — 2026-10-18 (1.1.0)

The forecast was replayed with `tools/backtest_forecast.py` over one maintainer's local history: about six weeks of readings every ~5 minutes, with a month-long gap when the 1.0.0 collector lost its CLI paths (fixed in 1.0.1). At every reading of every window that was observed until it filled up or reset, the forecast was compared with what actually happened.

| Limit | Windows used | Ran out | Correct warnings | False alarms | Median error | Median warning ahead |
|---|---|---|---|---|---|---|
| Claude, 5 hours | 41 | 1 | 28 | 0 | 15 min | 246 min |
| Codex, weekly | 74 | 6 | 118 | 0 | 26 min | 176 min |

What this does not show:
- It is one person's history, and only 7 windows ran out, so "zero false alarms" is a small sample.
- The Claude weekly limit never ran out in this history, so its warnings are untested.
- Readings where the forecast stayed quiet before a run-out are counted as missed (150 for Codex). They happen early in a window, before the last hour shows the pace.

The run-out time is reported only within 6 hours. With a 24-hour pace instead, the Codex error grew to about 14 hours, so 1.1.0 keeps the last hour and the 6-hour limit.

Notifications were tested with a mocked Scriptable `Notification` and `FileManager`: scheduling, a one-minute reset jitter, a broken local log, and the switch-off setting. Delivery on a real iPhone remains a manual check.

## Publication recheck — 2026-09-09

The current source is ready for an early community publication, with the manual acceptance items below still open. No blocking failure was found in the local checks. This is not a claim of a completed GitHub release or compatibility certification.

- `make dist` passed: 42 Python tests, 36 JavaScript tests, public-file preflight and release packaging.
- The resulting ZIP was extracted into a new temporary directory. With the workspace's `PYTHONPATH` removed, installer help, both test suites, public preflight, widget build and synthetic previews passed from that extracted copy.
- A real isolated Apple Silicon installation downloaded and verified CodexBar 0.56.7. The installed launcher ran `doctor --share`; changing from Codex-only/English to both providers/Russian survived reinstall. Uninstall removed the program and retained settings and the temporary cloud script as documented.
- The isolated install used `--no-start`, temporary state/cloud directories and deliberately unavailable provider executable paths. It did not sign in, collect account data or modify the existing LaunchAgent. The LaunchAgent file was compared before and after; temporary test files were removed.
- Local Markdown links resolved. The public preflight found no configured credential/personal-path patterns in the 48 public source files. This remains a focused check, not a comprehensive secret audit.
- Pinned commits for [checkout](https://github.com/actions/checkout/commit/3d3c42e5aac5ba805825da76410c181273ba90b1), [setup-python](https://github.com/actions/setup-python/commit/ece7cb06caefa5fff74198d8649806c4678c61a1) and [setup-node](https://github.com/actions/setup-node/commit/249970729cb0ef3589644e2896645e5dc5ba9c38) resolved in their official repositories. The workflows have not yet run on GitHub.

At this checkpoint the local repository has no commits or remote. Publication still requires choosing the GitHub destination, reviewing the first commit, running GitHub CI and attaching the built files to a release. Intel installation, sign-in on another Mac and final bilingual home/lock-screen checks on a real iPhone remain manual. See [release process](releasing.md).

## Earlier preparation checks

Local checks completed for the prepared 1.0.0 source archive:

- 42 Python tests and 36 JavaScript tests passed, using synthetic provider data.
- Configuration: neutral fresh defaults, migration of pre-public settings, one enabled provider, validation, literal filters, explicit pinned-window history and malformed settings leaving saved files unchanged.
- Isolated installer tests: copy/setup, launcher paths containing spaces, update retaining settings/history, no-start mode, LaunchAgent ownership and uninstall preserving history/cloud files.
- A ZIP was extracted into a temporary directory on an Apple Silicon Mac. A real `--no-start` installation downloaded the pinned CodexBar 0.56.7 release, verified its SHA-256 and version, wrote the widget to a temporary cloud directory, ran the installed `doctor --share`, and uninstalled. It used the host's installed Codex binary only for version discovery, without collecting account data or registering a LaunchAgent.
- Source ZIP reproducibility and checksums passed. Private/generated folders, databases, snapshots, live HTML and upstream binaries were excluded. The focused public-file preflight passed. Local documentation links resolved.
- Synthetic browser previews showed no measured text overflow at 380×396 and 338×354 in light/dark themes. All default groups are available in details; surplus widget rows have an overflow count.

Local runtimes were Python 3.13.2 and Node.js 20.19.4. The configured GitHub CI matrix uses Python 3.12/3.13 on Ubuntu/macOS and Node.js 24; it has **not run on GitHub yet**. Intel download/install, clean-machine sign-in, and final native iPhone acceptance remain to be verified. Native rendering and iCloud delivery cannot be certified by the browser preview or installer tests.

See [release process](releasing.md) for the remaining device checks and publication steps. This report contains no account readings or personal source diagnostics.

## English/Russian interface

Both widget languages now share the same metrics and source error codes. Tests cover locale isolation, missing-language snapshots, configuration migration, per-widget overrides and detail links, English dates/relative ages, expired and missing quotas, cached/error states, the setup screen, and executing the generated HTML in both languages. Browser checks covered English light/dark previews at 380×396 and 338×354, plus both languages at 329×345 with five windows, source errors, stale Fable and an awaited reset. No measured text overflow was found. Switching the English detail screen to token history worked in the browser.

CLI help/diagnostics use English; native widget and detail strings follow the chosen `en`/`ru` setting. New settings default to English and existing settings retain Russian until changed. Native iPhone verification of the bilingual build remains manual.
