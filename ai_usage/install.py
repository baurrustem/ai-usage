from __future__ import annotations

import hashlib
import os
import platform
import plistlib
import shlex
import shutil
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path

from .common import atomic_json, atomic_write
from .config import defaults, discover_claude, discover_codex, read_config, validate_config
from .service import sync_scripts

LABEL = "local.ai-usage.collector"
VERSION = "0.56.7"
HASHES = {"arm64": "2788f1cb65ae8eb6d697afaa640856fc9c7e917102fd74a288bc497ed56144c8",
          "x86_64": "f9bcee85fa038b589c18223a9bc07f75898da93b7d917c3046862c95b9a71159"}


class InstallationError(RuntimeError):
    """Controlled, user-readable installation diagnostic."""


def extract_release(archive: Path, destination: Path):
    with tarfile.open(archive) as bundle:
        for member in bundle.getmembers():
            path = (destination / member.name).resolve()
            # The official archive contains exactly this relative launcher symlink.
            launcher_link = member.name == "codexbar" and member.issym() and member.linkname == "CodexBarCLI"
            if not path.is_relative_to(destination.resolve()) or not (member.isfile() or member.isdir() or launcher_link):
                raise InstallationError("Unsafe entry in the CodexBar archive")
        bundle.extractall(destination, filter="data")


def fetch_codexbar(state: Path) -> Path:
    arch = platform.machine()
    if platform.system() != "Darwin" or arch not in HASHES:
        raise InstallationError("CodexBar installation supports macOS arm64 and x86_64")
    target = state / f"tools/codexbar-{VERSION}"
    binary = target / "codexbar"
    if binary.exists():
        check = subprocess.run([str(binary), "--version"], capture_output=True, text=True, timeout=10)
        if check.returncode == 0 and check.stdout.strip() == f"CodexBar {VERSION}":
            return binary
    target.parent.mkdir(parents=True, exist_ok=True)
    asset = f"CodexBarCLI-v{VERSION}-macos-{arch}.tar.gz"
    with tempfile.TemporaryDirectory(prefix=".codexbar-download-", dir=target.parent) as directory:
        directory = Path(directory)
        archive = directory / asset
        # curl uses the system trust store; never disable TLS verification.
        subprocess.run(["/usr/bin/curl", "--fail", "--silent", "--show-error", "--location", "--retry", "2", "--max-time", "120",
            "--output", str(archive), f"https://github.com/steipete/CodexBar/releases/download/v{VERSION}/{asset}"], check=True, timeout=260)
        if hashlib.sha256(archive.read_bytes()).hexdigest() != HASHES[arch]:
            raise InstallationError("CodexBar checksum mismatch; installation stopped")
        extracted = directory / "unpacked"
        extracted.mkdir()
        extract_release(archive, extracted)
        probe = subprocess.run([str(extracted / "codexbar"), "--version"], capture_output=True, text=True, timeout=10)
        if probe.returncode or probe.stdout.strip() != f"CodexBar {VERSION}":
            raise InstallationError("Could not verify the CodexBar version")
        if target.exists():
            shutil.rmtree(target)
        shutil.move(str(extracted), target)
    return binary


def plist_path() -> Path:
    return Path.home() / "Library/LaunchAgents" / f"{LABEL}.plist"


def launchctl(args, *, check=True):
    return subprocess.run(["/bin/launchctl", *args], capture_output=True, text=True, timeout=20, check=check)


def stop():
    if platform.system() == "Darwin":
        launchctl(["bootout", f"gui/{os.getuid()}/{LABEL}"], check=False)


def owns_launchagent(state: Path) -> bool:
    path = plist_path()
    if not path.exists():
        return False
    try:
        args = plistlib.loads(path.read_bytes())["ProgramArguments"]
        return Path(args[args.index("--state") + 1]).resolve() == state.resolve()
    except (KeyError, ValueError, IndexError, TypeError, plistlib.InvalidFileException):
        return False


def install(state: Path, *, scriptable_directory: str | None = None, start=True, config=None) -> dict:
    if platform.system() != "Darwin":
        raise InstallationError("Installation requires macOS (Apple Silicon or Intel)")
    if sys.version_info < (3, 12):
        raise InstallationError("Installation requires Python 3.12 or newer")
    if start and plist_path().exists() and not owns_launchagent(state):
        raise InstallationError("Another AI Usage state owns the LaunchAgent. Uninstall that installation before switching --state.")
    state.mkdir(parents=True, exist_ok=True, mode=0o700)
    config = config if config is not None else read_config(state)
    if not (state / "config.json").exists():
        for provider, discover in (("claude", discover_claude), ("codex", discover_codex)):
            key = provider + "Path"
            if provider in config["providers"] and config[key] == defaults(state)[key]:
                config[key] = discover()
    if scriptable_directory:
        config["scriptableDirectory"] = str(Path(scriptable_directory).expanduser().resolve())
    validate_config(config)
    config["codexbarPath"] = str(fetch_codexbar(state))
    source = Path(__file__).resolve().parent.parent
    target = state / "app"
    if start:
        stop()
    target.mkdir(exist_ok=True)
    if source.resolve() != target.resolve():
        for name in ("ai_usage", "scriptable"):
            shutil.copytree(source / name, target / name, dirs_exist_ok=True, ignore=shutil.ignore_patterns("__pycache__"))
        for name in ("LICENSE", "THIRD_PARTY_NOTICES.md"):
            if (source / name).is_file():
                shutil.copy2(source / name, target / name)
    atomic_json(state / "config.json", config)
    launcher = state / "bin/ai-usage"
    atomic_write(launcher, "#!/bin/sh\n" + f"export PYTHONPATH={shlex.quote(str(target))}\n" +
                 f"exec {shlex.quote(sys.executable)} -m ai_usage --state {shlex.quote(str(state))} \"$@\"\n")
    launcher.chmod(0o700)
    plist = {"Label": LABEL, "ProgramArguments": [sys.executable, "-m", "ai_usage", "--state", str(state), "collect"],
             "WorkingDirectory": str(target), "RunAtLoad": True, "StartInterval": 300,
             "EnvironmentVariables": {"PATH": config["path"], "PYTHONPATH": str(target), "TZ": config["timeZone"]},
             "ProcessType": "Background", "LowPriorityIO": True, "Umask": 0o077,
             "StandardOutPath": "/dev/null", "StandardErrorPath": "/dev/null"}
    cloud_ready = sync_scripts(target / "scriptable", Path(config["scriptableDirectory"]))
    started = False
    if start:
        path = plist_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        # --no-start does not alter an existing LaunchAgent, including another --state.
        atomic_write(path, plistlib.dumps(plist).decode("utf-8"))
        result = launchctl(["bootstrap", f"gui/{os.getuid()}", str(path)], check=False)
        started = result.returncode == 0
    return {"installed": True, "started": started, "scriptableReady": cloud_ready, "launcher": str(launcher),
            "message": "Installed" if not start or started else "Installed; LaunchAgent could not start in this macOS session"}


def uninstall(state: Path) -> dict:
    path = plist_path()
    if owns_launchagent(state):
        stop()
        path.unlink()
    for child in ("app", "bin", "tools"):
        path = state / child
        if path.is_dir():
            shutil.rmtree(path)
    return {"uninstalled": True, "historyRetained": str(state), "message": "Programs and LaunchAgent removed. History and iCloud files retained."}
