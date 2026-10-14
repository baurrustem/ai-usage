# Troubleshooting / Решение проблем

Start with `"$HOME/Library/Application Support/AI Usage/bin/ai-usage" doctor`. For a public issue, use `doctor --share`, review its output and include tool versions, macOS/iOS version, widget size and reproduction steps. Never attach auth files, raw transcripts, a database, a live snapshot or CLI debug output containing account data.

| Symptom / code | Action |
| --- | --- |
| Python unavailable/too old | Install Python 3.12+ and rerun `bash install.command`. `AI_USAGE_PYTHON=/absolute/path/to/python3 bash install.command` selects an interpreter. |
| `missing_tool` | Install/sign in to the enabled provider tool. Check `claudePath`/`codexPath`; disable a service you do not use. |
| `auth`, `cli_unavailable` | Run the exact configured CLI's sign-in flow. Claude Desktop and a separate Claude Code binary may have different auth stores. Verify `/usage` with that binary. |
| `loading`, `timeout` for Claude | CodexBar is waiting for its own `/usage` session. Wait for the next five-minute cycle. Upstream output changes may require an adapter update. |
| `rate_limited` | Let the next cycle retry. Do not repeatedly run manual collection. |
| `invalid_data` | Source output changed or local log parsing failed. Report versions and the controlled diagnostic, not raw source output. |
| Missing reset credits | Older Codex app-servers may omit the field. Set `codexPath` to a compatible newer installed CLI, then collect. An unavailable count differs from zero. |
| Missing individual model limit | It may be absent from the source response or your subscription. A configured pin may retain its last reading with a stale marker. Never substitute another model's limit. |
| `waiting_for_icloud` | Open Scriptable on iPhone and enable its iCloud Drive access. Wait for its real container to appear on Mac, then run `sync`. |
| Snapshot exists on Mac, widget old | Check Files → iCloud Drive → Scriptable → AI Usage on iPhone. Run AI Usage in Scriptable. iCloud delivery and WidgetKit refresh can be delayed. |
| Grey/amber/error state | Data may be stale, partially missing, cached after an iCloud error, or a source may need sign-in. Open details for each source's status. |
| Mac asleep/offline | Collection pauses; old data remains marked with its age. Wake/connect the Mac and wait for a cycle. |
| LaunchAgent not loaded | Run installer in your normal logged-in macOS GUI session. One scheduled state per user is supported. |
| Python moved/deleted | Reinstall with the current interpreter from a new source/release ZIP. |
| Clipped/very small text | Include device model, iOS version, widget size and text/display scaling. Use synthetic data for a screenshot, or redact real metrics. Browser previews are approximate. |

## Reading the display

If an application update removes its bundled Claude Code or Codex executable, the collector now searches installed tools again. This recovery applies only to recognized application bundle paths; working paths and custom executable paths are preserved. `doctor` uses the same resolution as collection. A newly found CLI may need a separate sign-in even when the desktop app is signed in. Successful iCloud publication only confirms that the file was written on the Mac, not that the phone has received it.

“Remaining” / “Осталось” is remaining quota; a circle represents 0–100%. The date is the expected reset time, not the age of the data. The single dot by the title summarizes freshness. “Awaiting update” / “Ожидается обновление” means the expected reset passed without a fresh source reading; the widget does not assume a reset has happened.

Tokens include cache reads and can be much larger than newly generated text. They cover available logs on one Mac. Human prompts and sessions exclude tool outputs and supported system/subagent events; provider log formats can change. A missing day is not guaranteed zero usage.

To change language after upgrading, run `ai-usage configure --language en` (or `ru`) and wait for the next collection. A widget Parameter such as `lang=ru` overrides the Mac setting; remove it to follow the shared setting. No account sign-in is needed to change language.
