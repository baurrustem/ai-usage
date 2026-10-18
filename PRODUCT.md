# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios

## Users

Developers and "vibe coders" who work every day in Claude Code and/or Codex on a paid subscription and keep running into usage limits. They glance at the iPhone home screen between tasks, often mid-session, and want one answer in a second: will my limit last until the reset, and if not, when does it run out. The maintainer (Baur Rustem) is also a daily user, but the public open-source audience comes first (confirmed 2026-10-18).

## Product Purpose

AI Usage puts Claude Code and Codex subscription limits, reset times and local token activity on the iPhone, without a backend: a macOS collector writes a snapshot to iCloud Drive and a Scriptable script renders native widgets and a detail screen. Since 1.1 it forecasts, from the pace of the last hour, whether a limit runs out before its reset within the next 6 hours, and sends iPhone notifications (limit reset, pace warning, a source that stopped answering, a Mac that stopped sending data). Success: the user never gets surprised by a limit and never trusts stale numbers.

## Positioning

Open source, local-only and honest about uncertainty: quota percentages are never converted into tokens, stale or failed data is always marked, and the forecast is a straight line through the last hour that says nothing beyond 6 hours. It was checked against the maintainer's own six weeks of history (docs/verification.md).

## Operating Context

- Rendered by Scriptable on iOS: native widget layout uses Scriptable's ListWidget (stacks, text, images, DrawContext drawings); no SwiftUI, no custom fonts beyond system fonts, limited animation. Widget refresh is controlled by iOS (requested every 15 minutes).
- Widget sizes: small, medium, large on the home screen; circular, rectangular and inline on the lock screen. The large home-screen widget is the one the maintainer uses and the one shown in posts (confirmed 2026-10-18).
- Tapping opens a self-contained WebView detail screen (no remote assets).
- Light and dark appearance; English and Russian.
- Data per provider: several quota windows (5-hour session, weekly, model-specific), reset times, Codex reset credits, tokens today/7/30 days, prompts and sessions from local logs, history for charts, source states (ok, stale, error codes).

## Capabilities and Constraints

- Providers: Claude (via CodexBar CLI `/usage`) and Codex (app-server `account/rateLimits/read`); one or both.
- Never infer token allowances from percentages; never hide stale/error states; no telemetry, no browser-cookie extraction.
- The forecast exists only for a limit with enough readings in the last hour; it may be absent.
- Snapshot schema version 1; new fields are optional for compatibility.

## Brand Commitments

- Name: AI Usage. MIT license. Independent of Anthropic, OpenAI, Apple and Scriptable: no provider logos or brand marks.
- Provider accent colors exist in code today (Claude terracotta, Codex teal); keeping them is not a binding commitment.

## Evidence on Hand

- Demo screenshots must use the synthetic fixtures (`tests/fixture.js`, `tools/preview_data.js`); real snapshots are personal data.
- Forecast accuracy on one person's history: docs/verification.md (small sample, 7 run-outs).

## Product Principles

1. One glance, one answer: "will it last until the reset?" comes before every other number.
2. Never show a number you cannot stand behind: stale, missing and estimated values look different from fresh ones.
3. Local and private by construction.
4. Quiet until it matters: warnings and notifications only when a limit is genuinely at risk or data stopped flowing.

## Accessibility & Inclusion

Readable at a glance in light and dark mode; status must not rely on color alone (text labels accompany color).
