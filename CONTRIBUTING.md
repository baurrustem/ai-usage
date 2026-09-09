# Contributing

Bug reports, documentation, accessibility improvements and tested provider adapters are welcome. Keep the widget readable on real iPhones and make unknown/stale data explicit.

## Local development

Use Python 3.12+ and Node.js 22+. There are no Python/npm runtime dependencies to install.

```bash
make test
make preview
make check-public
make dist
```

Tests use synthetic inputs and mocked installer/provider boundaries. They do not sign in, call subscription APIs or modify a real LaunchAgent. `tools/build_preview.js` and `tools/build_native_preview.js` use synthetic data by default. Explicit `--live` or `--snapshot PATH` is for local diagnosis only; never commit those outputs.

Open `artifacts/widget-preview.html` for a browser approximation of the same layout code. Test native Scriptable on a real iPhone for typography, dark/tinted themes, lock screen, offline cache and iCloud behavior. A passing browser layout check is not proof of WidgetKit rendering.

## Pull requests

Explain the user-visible problem, the final behavior and the checks performed. Use synthetic fixtures for parser regressions, including missing fields, multiple groups, expiry, duplicate events and source failure. Keep collection read-only. Do not log raw provider output or credentials. Document coverage and limitations of new metrics.

Run the public preflight before submission. Do not commit state files, copied upstream binaries/source caches, private verification journals, live previews or personal screenshots. The release builder uses an explicit source manifest; new intended public files must be covered by `tools/release_files.py`.

Contributions are provided under this repository's MIT license. Preserve third-party license notices. Discuss substantial architecture or scope changes in an issue first. Treat other contributors respectfully; disagreement about a design or implementation is welcome, harassment and publication of private information are not.
