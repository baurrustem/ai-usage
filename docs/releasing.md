# Release process

Use this process to prepare and publish a release. A local archive or Actions artifact alone is not a published GitHub release.

1. Confirm the project name, owner/copyright attribution and MIT license. The current attribution is “AI Usage contributors”; replace it if the owner prefers a name or handle.
2. Review the files Git will publish with `git status --short` and `git ls-files --cached --others --exclude-standard`. Review their contents. Private preparation notes stay in `.private/` and are ignored. Never use `git add -f` for snapshots, logs, caches or live previews.
3. Run `make dist`. It runs the account-free test suites and the public preflight, then creates `dist/ai-usage-VERSION.zip`, `dist/AI Usage.js` and `dist/SHA256SUMS`. The ZIP comes from an explicit allowlist, not a copy of the working directory. It contains source, docs, tests and the bundled Scriptable script; it contains neither CodexBar binaries nor account data.
4. Extract the ZIP into a clean directory and verify `bash install.command --help`, tests and a fresh installation on a Mac without an existing collector. Check both a single-service installation and both services, custom paths, upgrades and uninstall. Automated tests mock external downloads/launchd/auth; live clean-machine sign-in and native iPhone checks remain manual.
5. Create the GitHub repository, review the initial commit and push. Enable Actions, private vulnerability reporting and available secret-scanning/push-protection features. CI uses read-only repository permissions and does not require provider credentials.
6. Before tagging, update `ai_usage/__init__.py` and CHANGELOG. Push a matching `vVERSION` tag after CI passes. The release workflow builds downloadable **Actions artifacts only**; it does not publish automatically.
7. Create a draft GitHub release with the ZIP, widget script and SHA256SUMS from the successful tag workflow. Explain installation, compatible tool versions and known limitations. Publish after reviewing that draft and completing device checks.

## Device acceptance

- Compare quotas against the source tools; test activity from another device.
- Confirm one/both service configurations, overflow links and zero/unknown/reset-due states.
- Check each home/lock-screen size, light/dark/system-tinted appearance and display/text scaling.
- Test iCloud delay/corruption, offline iPhone, sleeping Mac and expired authorization.
- Confirm fresh installation, update retaining settings/history, and uninstall retaining personal data.

The native widget has been used on an iPhone, but automated/browser tests do not certify all items above. Record actual results without account details. Do not publish the original personal verification journal.
