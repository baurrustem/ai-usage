---
name: AI Usage
description: Claude Code and Codex subscription limits on the iPhone home screen, set as a prepaid package balance.
colors:
  field-claude: "#B0482A"
  field-claude-dark: "#9C4124"
  field-codex: "#1C6A55"
  field-codex-dark: "#15513F"
  ground-paper: "#E9E4DA"
  ground-night: "#111111"
  cream-ink: "#FFF6EA"
  cream-ink-soft: "rgba(255, 246, 234, 0.78)"
  cream-ink-faint: "rgba(255, 246, 234, 0.26)"
  runout-amber: "#FFB020"
  amber-ink: "#1E1405"
  stale-graphite: "#66625B"
  stale-graphite-dark: "#3B3A37"
  detail-bg: "#FFFFFF"
  detail-bg-dark: "#171717"
  detail-text: "#222222"
  detail-text-dark: "#EEEEEE"
  detail-muted: "#767676"
  detail-muted-dark: "#999999"
  detail-line: "#EDEDED"
  detail-line-dark: "#303030"
  detail-surface: "#F6F6F6"
  detail-surface-dark: "#282828"
  detail-claude: "#C2512B"
  detail-claude-dark: "#E38463"
  detail-codex: "#1C6A55"
  detail-codex-dark: "#56B99A"
  detail-source-note: "#A56A39"
  detail-source-note-dark: "#C79B72"
typography:
  display-large:
    fontFamily: "DINCondensed-Bold, Font.boldSystemFont fallback"
    fontSize: "58pt"
    fontWeight: 700
    lineHeight: 1
  display-medium:
    fontFamily: "DINCondensed-Bold, Font.boldSystemFont fallback"
    fontSize: "50pt"
    fontWeight: 700
    lineHeight: 1
  display-small:
    fontFamily: "DINCondensed-Bold, Font.boldSystemFont fallback"
    fontSize: "46pt"
    fontWeight: 700
    lineHeight: 1
  verdict-clock:
    fontFamily: "DINCondensed-Bold, Font.boldSystemFont fallback"
    fontSize: "38pt"
    fontWeight: 700
    lineHeight: 1
  verdict-clock-compact:
    fontFamily: "DINCondensed-Bold, Font.boldSystemFont fallback"
    fontSize: "34pt"
    fontWeight: 700
    lineHeight: 1
  verdict-clock-small:
    fontFamily: "DINCondensed-Bold, Font.boldSystemFont fallback"
    fontSize: "20pt"
    fontWeight: 700
    lineHeight: 1
  verdict-label:
    fontFamily: "SF Pro (Font.boldSystemFont)"
    fontSize: "12pt"
    fontWeight: 700
  verdict-text:
    fontFamily: "SF Pro (Font.boldSystemFont)"
    fontSize: "13pt"
    fontWeight: 700
  title:
    fontFamily: "SF Pro (Font.semiboldSystemFont)"
    fontSize: "13pt"
    fontWeight: 600
  title-small:
    fontFamily: "SF Pro (Font.semiboldSystemFont)"
    fontSize: "12pt"
    fontWeight: 600
  label:
    fontFamily: "SF Pro (Font.semiboldSystemFont)"
    fontSize: "11pt"
    fontWeight: 600
  caption:
    fontFamily: "SF Pro (Font.mediumSystemFont)"
    fontSize: "11pt"
    fontWeight: 500
  row-label:
    fontFamily: "SF Pro (Font.mediumSystemFont)"
    fontSize: "11.5pt"
    fontWeight: 500
  row-value:
    fontFamily: "SF Pro (Font.boldSystemFont)"
    fontSize: "12pt"
    fontWeight: 700
  detail-headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "23px"
    fontWeight: 600
    letterSpacing: "-0.65px"
  detail-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  detail-figure:
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "19px"
    fontWeight: 500
    letterSpacing: "-0.5px"
    fontFeature: "tnum"
  detail-body:
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  detail-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  card-large: "15pt"
  verdict-block: "12pt"
  pill: "9999px"
  detail-section: "12px"
  detail-control: "6px"
  detail-track: "2px"
spacing:
  ground-inset: "8pt"
  card-gap: "6pt"
  card-pad: "15pt"
  card-pad-small: "13pt"
  verdict-inset: "11pt"
  column-gap: "8pt"
  row-height: "19pt"
  detail-page-x: "22px"
  detail-section-pad: "17px 16px 2px"
  detail-row-pad: "14px 0 13px"
components:
  package-card:
    backgroundColor: "{colors.field-claude}"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.card-large}"
    padding: "15pt"
  package-card-codex:
    backgroundColor: "{colors.field-codex}"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.card-large}"
    padding: "15pt"
  package-card-stale:
    backgroundColor: "{colors.stale-graphite}"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.card-large}"
    padding: "15pt"
  verdict-warn:
    backgroundColor: "{colors.runout-amber}"
    textColor: "{colors.amber-ink}"
    rounded: "{rounded.verdict-block}"
    padding: "7pt 11pt"
  verdict-plain:
    textColor: "{colors.cream-ink}"
    padding: "3pt 0"
  range-bar:
    backgroundColor: "{colors.cream-ink-faint}"
    rounded: "{rounded.pill}"
    height: "9pt"
  range-bar-small:
    backgroundColor: "{colors.cream-ink-faint}"
    rounded: "{rounded.pill}"
    height: "6pt"
  limit-row-bar:
    backgroundColor: "{colors.cream-ink-faint}"
    rounded: "{rounded.pill}"
    height: "3pt"
  detail-provider-section:
    backgroundColor: "{colors.detail-bg}"
    textColor: "{colors.detail-text}"
    rounded: "{rounded.detail-section}"
    padding: "17px 16px 2px"
  detail-runout-pill:
    backgroundColor: "{colors.runout-amber}"
    textColor: "{colors.amber-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  detail-segmented-active:
    backgroundColor: "{colors.detail-surface}"
    textColor: "{colors.detail-text}"
    rounded: "4px"
    padding: "8px 12px"
---

# Design System: AI Usage

## Overview

**Creative North Star: "The Carrier Package Balance"**

A subscription limit is read the way a prepaid phone balance is read: how much is left, when it renews, and whether it carries you to the renewal. Every home-screen widget is a full, saturated colour field per provider, set in cream ink, with the remaining percent in a heavy condensed numeral and the verdict ("Runs out ~21:46", "Lasts until 22:26", "Renews Wed 20:36") set as a second headline. The category default of rings and evenly weighted percent tiles is refused on the home screen: one limit leads, the rest shrink to one-line bars or a footer line.

Density is low and hierarchical. The binding limit (at-risk first, then the account-wide window with a pace, then the account-wide window with least left) owns the numeral, the verdict and the range bar; everything else is small. Colour carries identity (clay for Claude Code, pine for Codex) and exactly one alarm (amber for "runs out"). Untrustworthy data drains the field to graphite and says so in words. Status never relies on colour alone.

The detail WebView is the quiet companion: white or near-black page, hairline-bordered provider sections, small type, provider accent on tracks and figures, and the same amber pill for the run-out forecast.

**Key Characteristics:**
- One saturated colour field per provider, cream ink throughout.
- Heavy condensed numerals (DIN Condensed Bold) for the remaining percent and the verdict clock.
- One amber, used only for "runs out".
- The range bar: a time axis from now to the reset, cream for how far the quota carries you, amber hatching for the uncovered stretch.
- Stale and missing data drain to graphite with a text label.

## Colors

Two saturated provider fields on a paper or night ground, one warm cream ink, one alarm amber, one drained graphite.

### Primary
- **Clay Field** (field-claude, deeper field-claude-dark in dark appearance): the whole Claude Code card. Never used as text or accent on a field.
- **Pine Field** (field-codex, deeper field-codex-dark in dark appearance): the whole Codex card.

### Secondary
- **Run-out Amber** (runout-amber) with **Amber Ink** (amber-ink): the verdict block and the hatched stretch of the range bar when the forecast says the limit runs out before the reset; the forecast pill in the detail screen. Nothing else.

### Neutral
- **Cream Ink** (cream-ink): every glyph and the covered run of every bar on a field. Soft cream (78%) is used only for the numeral on a drained card; faint cream (26%) is the bar track.
- **Warm Paper** (ground-paper) / **Night** (ground-night): the ground showing around the cards of the large widget, light and dark.
- **Graphite** (stale-graphite, stale-graphite-dark): replaces the provider field when data is stale or missing.
- **Detail page neutrals** (detail-bg, detail-text, detail-muted, detail-line, detail-surface, each with a dark twin) and the detail accents detail-claude / detail-codex (lighter twins in dark), with detail-source-note for the stale-source explanation.

### Named Rules
**The One Alarm Rule.** Amber means "runs out before the reset" and nothing else. It is never decoration, never a provider colour, never a generic warning.

**The Drain Rule.** When a card's data cannot be stood behind (stale, retained or missing), the provider field is replaced by graphite and the verdict says "Stale data · age" or the source caption. Colour change alone is never the signal.

**The Field Is The Brand Rule.** Provider identity is the colour of the whole card, not a logo, dot or tint. No provider logos or brand marks.

## Typography

**Display Font:** DIN Condensed Bold (`DINCondensed-Bold`, with `Font.boldSystemFont` fallback)
**Body Font:** SF Pro via Scriptable system fonts (semibold, medium, bold)
**Detail Screen Font:** -apple-system, BlinkMacSystemFont, sans-serif

**Character:** A tall, utilitarian condensed numeral reads like a meter or a ticket balance; SF Pro at 11 to 13pt carries every word around it.

### Hierarchy
- **Display** (DIN Condensed Bold, 58pt large card / 50pt short card / 46pt small): the remaining percent of the binding limit, left-aligned at the card's padding minus 1pt.
- **Verdict clock** (DIN Condensed Bold, 38pt / 34pt when the bar sits higher / 20pt small): the run-out, lasts-until or renews time, prefixed with "~" when forecast.
- **Verdict label** (SF bold 12pt): "Runs out", "Lasts until", "Renews" above the clock. Verdict text without a clock (stale, due, missing, reset unknown) is SF bold 13pt.
- **Title** (SF semibold 13pt, 12pt on small): provider name, top left.
- **Label** (SF semibold 11pt): "left · 5 hours limit" under the numeral; the footer line.
- **Caption** (SF medium 11pt): freshness top right, the verdict detail under the range bar ("~40m without quota until 22:26").
- **Row** (SF medium 11.5pt label, SF bold 12pt right-aligned value): secondary limit rows.
- **Detail screen**: headline 23px/600/-0.65px; section title 14px/600; limit figure 19px/500 tabular; body 13px; labels and notes 10 to 12px muted.

### Named Rules
**The Two Numerals Rule.** A card has exactly two display numerals: the remaining percent and the verdict clock. Every other number is SF at 11 to 12pt.

**The Words Over Glyphs Rule.** States are spelled out ("Stale data", "Runs out", "Renews"), never encoded as icons.

## Layout

All home-screen widgets are drawn as one DrawContext image per card at exact point sizes from `widgetMetrics(screenWidth)`:

| screen width | small | medium / large width | large height |
|---|---|---|---|
| ≥ 428 | 170 | 364 | 382 |
| ≥ 390 (default) | 158 | 338 | 354 |
| ≥ 375 | 155 | 329 | 345 |
| narrower | 141 | 292 | 311 |

- **Large:** ground inset 8pt on all sides; one card per provider stacked with a 6pt gap; two providers split the height equally.
- **Medium / small:** one edge-to-edge card for the selected provider; the widget background takes the card colour.
- **Card grid (medium/large):** 15pt padding. Left column `min(150, inner × 0.46)` holds the numeral and its "left · limit" label; the verdict sits in the right column from x = left + 8pt, top 26pt. The range bar spans the full inner width below (y 108pt on tall cards, ≤ 99pt on short cards), its detail line 13pt beneath.
- **Card height decides depth:** under 160pt is "short" (smaller numeral); 200pt and over is "tall" and lists secondary limits as 19pt rows above a footer; otherwise the other limits fold into one footer line ("Weekly 42% · Fable · Weekly 79%", "+N more in details").
- **Small:** 13pt padding; numeral at y 26, label at y 72, verdict block at y 90 (46pt tall), and a 6pt range bar (no end ticks) or the detail text at the foot.
- **Detail screen:** single column, max-width 560px, 28px/22px page padding (16px under 350px width), provider sections 14px apart.

## Elevation & Depth

Flat. Depth comes from colour fields sitting on a contrasting ground and from the amber block sitting on the field; no shadows exist in the widget or the detail screen. (The preview harness page adds a drop shadow around its widget frames; that belongs to the harness, not the system.)

**The Flat Field Rule.** Separation is by colour and gap, never by shadow or blur.

## Shapes

Soft rectangles and full pills. Large-widget cards round at 15pt; medium and small cards are square in code and take the system widget mask. The verdict block rounds at 12pt. Every bar is a full pill (radius = half its height). The range bar alone carries square end ticks: 1.5pt wide, extending 3pt above and below the track, marking "now" and "reset". Detail sections round at 12px with a 1px hairline; controls at 6px; tracks at 2px.

## Components

### Package Card (signature)
Full provider field, cream ink, one DrawContext image.
- **Corner Style:** 15pt on large; system mask on medium/small.
- **Background:** provider field (light / dark variant); graphite when drained.
- **Content order:** provider name top left, freshness ("2m ago", or "cache") top right; on small Codex the corner shows "Resets: N" instead. Numeral, "left · <limit> limit", verdict, range bar, detail line, secondary rows or footer.
- **Footer:** Codex leads with "Resets: N"; tall cards add "tokens today: X · prompts: Y", appending "*" when that source is stale.
- **Tap:** opens the detail screen for that provider and language.

### Verdict Block
The verdict set as a headline; mood comes from `packageVerdict`.
- **warn** ("Runs out ~HH:MM"): amber block, 12pt radius, 11pt inset, amber ink label and clock. Detail: "~N without quota until HH:MM". Bar fraction = (run-out − now) / (reset − now).
- **ok** ("Lasts until HH:MM", reset within 6 h and a forecast exists): no block, cream label and clock. Detail: "about N% left at reset". Bar fully covered.
- **plain** ("Renews <clock>"): no block, cream. Detail: "too far to forecast · in 3d" or "no forecast yet · in N". Bar track only, no fill. Also used for "Reset time unavailable" without a clock.
- **due** ("Awaiting update"): cream text, no clock, track only.
- **stale** ("Stale data · age"): card drains to graphite, numeral in soft cream, detail carries the source message, track only.
- **missing** (no readable limit): graphite card, numeral "—", verdict is the source caption ("Sign in on Mac", "Loading limits", "Limits unavailable").

### Range Bar (signature)
A time axis from now (left tick) to the reset (right tick). Faint cream pill track (9pt tall on medium/large, 6pt on small without ticks); the cream run is how far the remaining quota carries you (minimum one bar-height so it reads as a cap). In the warn mood the uncovered stretch is hatched with amber stripes 2.5pt wide every 5pt, inset 1pt vertically, starting 3pt after the cream run and stopping half a bar-height before the end. Not a percent meter: length is time.

### Limit Row (secondary limits, tall cards only)
Label (SF medium 11.5pt, up to `min(170, inner × 0.5)` wide), a 3pt faint-cream pill track with a cream fill for remaining percent (minimum 3pt), and the percent right-aligned in SF bold 12pt in a 46pt cell.

### Detail Screen
- **Provider section:** 1px hairline, 12px radius, accent dot (6px) before the name, muted age at right.
- **Quota row:** label 12px, figure 19px/500 tabular, 3px accent track on hairline grey, muted reset line 10px; the run-out forecast is an amber pill (amber ink, 600, 11px, 3px 9px, full radius); "lasts until" stays muted text. Active state: opacity 0.65.
- **Disclosure:** `details` rows at 52px min height, chevron rotating 180° over 0.15s.
- **Controls:** select and segmented control with 1px hairline and 6px radius; pressed segment on detail-surface. Focus: 2px accent outline, 3px offset.

### Lock-screen families (unchanged legacy)
Circular, rectangular and inline lock-screen widgets keep their earlier text-and-ring function and are outside this world; they are not a pattern for new surfaces.

## Do's and Don'ts

### Do:
- **Do** give each provider its whole card in its field colour, with cream ink for every glyph and bar.
- **Do** lead with the binding limit and set its percent and verdict clock in DIN Condensed Bold; keep everything else in SF at 11 to 13pt.
- **Do** draw time-to-reset as the range bar with "now" and "reset" ticks; hatch the uncovered stretch in amber only in the warn mood.
- **Do** drain stale or missing cards to graphite and say "Stale data · age" or the source caption in words.
- **Do** size widgets from `widgetMetrics` and use the deeper field values in dark appearance.

### Don't:
- **Don't** use rings or evenly weighted percent tiles on home-screen widgets.
- **Don't** use amber for anything except "runs out before the reset".
- **Don't** add shadows, gradients or provider logos.
- **Don't** add a third display numeral to a card, or encode a state with colour alone.
- **Don't** convert percentages into token allowances, or draw a forecast for a reset more than 6 hours away.

## Verification notes

Captures in `.impeccable/review/` come from `tools/widget_preview.js` in a desktop browser, which maps `DINCondensed-Bold` to the macOS "DIN Condensed" face. Not verified on a device: whether Scriptable's `new Font("DINCondensed-Bold", size)` resolves on iOS, its exact metrics against the 52 to 60pt text rects, and how the `Font.boldSystemFont` fallback fits those rects. Not re-verified on a device: the lock-screen families, which this build left unchanged.
