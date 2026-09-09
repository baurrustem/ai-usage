# Configuration / Настройки

Settings live on the Mac in `~/Library/Application Support/AI Usage/config.json`. Prefer `configure` or `install --config` rather than editing generated files. All paths are local to your own machine. `$HOME` inside JSON is not expanded; use `~` or an absolute path.

Настройки находятся только на Mac. Команда `configure` проверяет их и сохраняет, не обращаясь к аккаунтам и не меняя LaunchAgent. Новые параметры применяются при следующем сборе. `sync` повторяет уже сохранённый снимок; новые фильтры появятся после `collect`.

## Common settings

| Field | Default | Purpose |
| --- | --- | --- |
| `configVersion` | `1` | Configuration format |
| `providers` | `["claude", "codex"]` | Choose one or both; disabled services are not queried or exported |
| `language` | `"en"` for new installs | Widget/detail language: `en` or `ru`; older installations keep Russian |
| `timeZone` | Mac's IANA zone, UTC fallback | Day boundaries and reset dates |
| `scriptableDirectory` | Detected Scriptable iCloud container | Must already exist; the collector does not create a fake container |
| `claudePath`, `codexPath` | Discovered installed tools | Override with full executable paths if detection chooses the wrong account/tool |
| `codexbarPath` | Pinned tool under the state directory | Managed by installer; changing version can break parsing |
| `codexHome` | `null` | Optional custom Codex configuration/log root; sets `CODEX_HOME` in child processes |
| `claudeConfigDir` | `null` | Optional custom Claude configuration/log root |
| `path` | Installer's `PATH` | Child-tool executable search path |
| `display` | `{}` | Optional per-provider limit filters and retained windows |

Choose the time zone before the first collection. Changing it later does not re-bin already stored daily totals: the next import replaces the available last 30 days, while older daily history keeps its previous boundaries. Do not compare days across such a change without accounting for this.

```bash
# From the extracted source directory, before initial installation
bash install.command --config examples/config.example.json

# Or edit a copy and apply it after installation
"$HOME/Library/Application Support/AI Usage/bin/ai-usage" configure --config /path/to/my-settings.json
```

Configuration-file fields replace the corresponding saved fields; importing `display` replaces the whole display object. CLI flags are applied afterward. Invalid settings leave the existing file unchanged.

## Filters

`--hide-limit PROVIDER:TERM` adds a case-insensitive literal substring filter over the limit ID, group ID, group name, and title. It is not a regular expression. Repeating a term does not duplicate it. `--show-all-limits` clears these filters. Filters affect presentation, not collection or stored history.

```bash
"$HOME/Library/Application Support/AI Usage/bin/ai-usage" configure \
  --hide-limit claude:sonnet --hide-limit codex:spark --hide-limit codex:codex_bengalfox
```

Use the actual IDs from your local snapshot when a provider uses internal names. All returned groups are visible in the detail screen by default; physical widget sizes have row limits.

## Pinned windows / Закреплённые лимиты

Some CLI reads can omit a named model window. `display.PROVIDER.pinnedLimits` can retain the last observed value for an **exact ID** with its own timestamp. The [filtered example](../examples/filtered-limits.example.json) demonstrates an optional Fable preference from the original private build. It is not a promise that your account has that model/window.

Each pin contains `id`, a short `title`, and optional positive `windowMinutes`. A pin does not create a quota: without matching history its value is unavailable. A past reset without a fresh reading shows “Ожидается обновление”, never 100%. Hidden terms still take precedence over pins. Use short display titles so they fit in a widget.

Old pre-public configuration files without `configVersion` migrate the original filters/pin on upgrade. Fresh installations use neutral defaults. To remove a pin, apply a configuration with an empty `pinnedLimits` array (or `display: {}` to reset all display preferences).

## Custom state directory and no-start mode

```bash
python3 -m ai_usage --state /absolute/path/to/state install \
  --providers codex --scriptable-dir /absolute/path/to/Scriptable --no-start
```

`--no-start` copies the program, downloads/verifies CodexBar and synchronizes the script if the specified folder exists. It does **not** collect data, stop a running collector, or create/replace a LaunchAgent. Use a temporary Scriptable directory too when experimenting.

A macOS user has one scheduled collector. Starting another state directory is refused while a different state owns the LaunchAgent; uninstall the previous scheduled installation first. `uninstall` only removes a LaunchAgent owned by its own state directory.

## Widget parameters

| Parameter | Result |
| --- | --- |
| `codex;lang=en` / `claude;lang=ru` | Override the language for one widget and its detail links |
| `claude` / `codex` | Service for the small widget and opened detail screen |
| `codex;group=ID` | Select a group for small/lock-screen widgets |
| `codex;limit=ID:primary` | Select an exact window |

Medium/large widgets show enabled providers. Large widgets show at most three Claude windows and two Codex windows, with an overflow count linking to details. Range/metric parameters do not change these summary cards; history periods are selected in the detail screen.

Language changes affect labels, relative ages and date formatting, not the chosen time zone or any numeric metrics. The optional snapshot `language` field is backward compatible with schema 1. CLI diagnostics/help use English; widget diagnostics translate controlled source codes into the selected language. Custom model/group names remain source data. Preview builders accept `--language en` or `--language ru`.
