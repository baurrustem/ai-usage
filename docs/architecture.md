# Architecture and privacy

```text
Codex app-server             Claude CLI via CodexBar
  account/rateLimits/read      own /usage session
             \                 /
              Python collector      Local session logs
              (every 5 minutes)  ←  tokens and activity
                      |
                 SQLite on Mac
                      |
               atomic JSON snapshot
                      |
                 iCloud Drive
                      |
             Scriptable on iPhone
             widget + WebView details
```

`ai_usage/providers.py` normalizes provider output into quota windows and daily token records. `activity.py` scans supported JSONL formats in a subprocess, deduplicates human prompt events and hashes session IDs. `store.py` stores last successful source results independently, observations and daily counters. Repeated imports replace daily records rather than add totals. `service.py` coordinates bounded reads, retains stale results on failure, and synchronizes the bundle and snapshot.

`scriptable/core.js` validates schema version 1, caches the last valid snapshot on the phone and renders native widgets plus a self-contained WebView. Invalid or older iCloud data does not replace a valid newer cache. Configured filters apply to presentation; pinned windows use only their own historical readings. The WebView has no remote scripts/assets and restricts navigation.

## Data boundaries

- **Read on Mac:** normalized provider account limits; local session logs via CodexBar cost and the activity scanner. Source tools use their own existing authentication.
- **Stored on Mac:** configuration paths, normalized source status/results, 90 days of observations/counters and hashed session IDs. Temporary process output is not logged verbatim.
- **Written to iCloud:** version/timestamps, enabled provider names and quota-window metadata, remaining-reset-credit count/known expiry, last 30 days of quota history and daily token/activity counts, hashed session IDs, and display/language preferences. Auth material, reset-credit IDs, account email, transcript content and project paths are not exported.
- **Cached on iPhone:** the last validated snapshot. Opening details does not send data to this project or write to the source snapshot.

No analytics endpoint or hosted backend is part of AI Usage. Upstream tools and iCloud perform their own network activity under their own policies. Hashing session IDs supports deduplication; it does not make the overall usage history anonymous. JSON/screenshot exports can reveal working patterns and model usage.

The collector runs without root, with restrictive file permissions and atomic file replacement. Installation downloads one version-pinned CodexBar archive over verified TLS and checks its SHA-256 before extraction. No provider credentials are bundled. Source errors are reduced to controlled codes/messages rather than raw subprocess output.

## Extension boundaries

A future provider needs its own adapter, normalization fixtures, local/account coverage labels, timeout/error handling and widget support. Do not infer token allowances from quota percentages. Do not add browser-cookie extraction, telemetry, payment actions or reset redemption as implicit fallbacks.

Current scope: one Mac, one account per enabled provider, the same iCloud account on iPhone, 90-day local retention and 30-day synchronized history. Configuration version and snapshot version are separate. Optional display/activity/reset fields preserve compatibility with older schema-1 snapshots; one or two known providers are accepted.

Localization uses immutable per-language API instances and a message catalog inside `scriptable/core.js`. Native widgets, HTML, cache/source states and dates share the same strings. Both languages render from the same metrics. HTML helpers and the selected language/catalog are embedded into the standalone WebView; no translation service is called.
