from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
from pathlib import Path

from .common import atomic_json
from .config import DEFAULT_STATE, ConfigurationError, read_config, update_config
from .install import InstallationError
from .service import collect, configure_logging, sync_scripts


def doctor(state, config):
    checks = {}
    for key in [p + "Path" for p in config["providers"]] + ["codexbarPath"]:
        binary = config[key]
        available = Path(binary).is_file() if Path(binary).is_absolute() else bool(shutil.which(binary))
        version = None
        if available:
            try:
                result = subprocess.run([binary, "--version"], capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    version = result.stdout.strip().splitlines()[0][:100]
            except (OSError, subprocess.TimeoutExpired, IndexError):
                pass
        checks[key] = {"available": available, "version": version}
    folder = Path(config["scriptableDirectory"])
    result = {"tools": checks, "iCloudFolderExists": folder.is_dir(), "iCloudFolderWritable": os.access(folder, os.W_OK),
              "snapshotExists": (folder / "AI Usage/snapshot.json").is_file(), "stateDirectory": str(state),
              "timeZone": config["timeZone"], "providers": config["providers"],
              "language": config["language"],
              "note": "A file on the Mac does not confirm delivery to the iPhone"}
    status = state / "status.json"
    if status.exists():
        result["lastCollection"] = json.loads(status.read_text())
    from .install import LABEL, launchctl, owns_launchagent
    try:
        result["launchAgentLoaded"] = owns_launchagent(state) and launchctl(["print", f"gui/{os.getuid()}/{LABEL}"], check=False).returncode == 0
    except (OSError, subprocess.SubprocessError):
        result["launchAgentLoaded"] = False
    return result


def main():
    parser = argparse.ArgumentParser(description="AI Usage — subscription limits for Scriptable")
    parser.add_argument("--state", type=Path, default=DEFAULT_STATE, help="Local collector state directory")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("collect", help="Collect metrics and synchronize them to iCloud")
    diagnosis = commands.add_parser("doctor", help="Check tools, LaunchAgent and iCloud")
    diagnosis.add_argument("--share", action="store_true", help="Exclude local paths and time zone from diagnostics")
    commands.add_parser("sync", help="Retry script and snapshot synchronization")
    commands.add_parser("fetch-codexbar", help="Install verified CodexBar CLI 0.56.7")
    setup = commands.add_parser("install", help="Install collector and five-minute LaunchAgent")
    setup.add_argument("--scriptable-dir", help="Scriptable directory in iCloud Drive")
    setup.add_argument("--no-start", action="store_true", help="Install without starting or modifying the LaunchAgent")
    settings = commands.add_parser("configure", help="Save settings without collecting or changing the LaunchAgent")
    settings.add_argument("--scriptable-dir", help="Scriptable directory in iCloud Drive")
    for command in (setup, settings):
        command.add_argument("--config", type=Path, help="Import settings from a JSON file")
        command.add_argument("--providers", help="claude, codex, or claude,codex")
        command.add_argument("--time-zone", help="IANA time zone, e.g. Europe/Paris")
        command.add_argument("--language", choices=("en", "ru"), help="Widget and detail-screen language (new installs: en)")
        command.add_argument("--hide-limit", action="append", help="Hide matching limit names/IDs, e.g. codex:spark")
        command.add_argument("--show-all-limits", action="store_true", help="Clear limit-name filters")
    commands.add_parser("uninstall", help="Remove programs and LaunchAgent, retaining history")
    args = parser.parse_args()
    state = args.state.expanduser().resolve()
    os.umask(0o077)
    try:
        config = read_config(state)
        if args.command in ("install", "configure"):
            overrides = json.loads(args.config.expanduser().read_text()) if args.config else None
            config = update_config(config, overrides=overrides, providers=args.providers, time_zone=args.time_zone,
                language=args.language, hidden_limits=args.hide_limit, show_all=args.show_all_limits, scriptable_directory=args.scriptable_dir)
        if args.command == "collect":
            configure_logging(state)
            result = collect(state, config)
        elif args.command == "doctor":
            result = doctor(state, config)
            if args.share:
                result.pop("stateDirectory", None)
                result.pop("timeZone", None)
        elif args.command == "configure":
            atomic_json(state / "config.json", config)
            result = {"configured": True, "providers": config["providers"], "timeZone": config["timeZone"],
                      "language": config["language"],
                      "message": "Settings saved. They apply on the next collection; run collect to update now."}
        elif args.command == "install":
            from .install import install
            result = install(state, config=config, start=not args.no_start)
        elif args.command == "uninstall":
            from .install import uninstall
            result = uninstall(state)
        elif args.command == "fetch-codexbar":
            from .install import fetch_codexbar
            config["codexbarPath"] = str(fetch_codexbar(state))
            atomic_json(state / "config.json", config)
            result = {"codexbarPath": config["codexbarPath"]}
        else:
            from .service import publish
            cloud = Path(config["scriptableDirectory"])
            synced = sync_scripts(Path(__file__).resolve().parent.parent / "scriptable", cloud)
            snapshot = state / "snapshot.json"
            result = {"scriptsSynced": synced, "publication": publish(json.loads(snapshot.read_text()), state, cloud) if snapshot.exists() else {"state": "no_snapshot"}}
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (InstallationError, ConfigurationError) as error:
        print(json.dumps({"state": "error", "message": str(error)}, ensure_ascii=False))
        return 1
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        # Avoid repr of subprocess exceptions: commands or their output may contain private data.
        print(json.dumps({"state": "error", "type": type(error).__name__, "message": "Command failed. Check doctor, configured paths and network access."}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
