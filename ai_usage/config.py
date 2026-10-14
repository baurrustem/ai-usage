from __future__ import annotations

import copy
import json
import os
import shutil
import re
import subprocess
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

DEFAULT_STATE = Path.home() / "Library/Application Support/AI Usage"
SCRIPTABLE_FOLDER = Path.home() / "Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents"


def discover_codex() -> str:
    """Desktop may bundle a newer app-server with reset-credit support."""
    candidates = [Path(p) for p in [shutil.which("codex")] if p]
    for root in (Path("/Applications"), Path.home() / "Applications"):
        candidates.extend(root / name / "Contents/Resources/codex" for name in ("ChatGPT.app", "Codex.app"))
    versions = []
    for path in dict.fromkeys(candidates):
        if not path.is_file():
            continue
        try:
            result = subprocess.run([str(path), "--version"], capture_output=True, text=True, timeout=8)
            match = re.search(r"(\d+)\.(\d+)\.(\d+)", result.stdout)
            if result.returncode == 0 and match:
                versions.append((tuple(map(int, match.groups())), str(path)))
        except (OSError, subprocess.SubprocessError):
            continue
    return max(versions)[1] if versions else (shutil.which("codex") or "codex")


def discover_claude() -> str:
    """Prefer a signed-in CLI; Desktop's bundled CLI may use a separate auth store."""
    candidates = [Path(p) for p in [shutil.which("claude")] if p]
    native = Path.home() / "Library/Application Support/Claude/claude-code"
    candidates.extend(sorted(native.glob("*/claude.app/Contents/MacOS/claude"), reverse=True)[:3])
    local = Path.home() / ".local/bin/claude"
    if local.is_file():
        candidates.append(local)
    versions = []
    for path in dict.fromkeys(candidates):
        try:
            result = subprocess.run([str(path), "--version"], capture_output=True, text=True, timeout=8)
            match = re.search(r"(\d+)\.(\d+)\.(\d+)", result.stdout)
            if result.returncode == 0 and match:
                auth = subprocess.run([str(path), "auth", "status"], capture_output=True, text=True, timeout=8)
                try:
                    signed_in = json.loads(auth.stdout).get("loggedIn") is True
                except (ValueError, AttributeError):
                    signed_in = False
                versions.append((signed_in, tuple(map(int, match.groups())), str(path)))
        except (OSError, subprocess.SubprocessError):
            continue
    return max(versions)[2] if versions else (shutil.which("claude") or "claude")


class ConfigurationError(ValueError):
    """Safe configuration errors contain field names, never file contents."""


def resolve_provider_tools(config: dict) -> dict:
    """Recover vanished bundled CLIs after app updates; preserve custom paths."""
    result = copy.deepcopy(config)
    for provider, discover in (("codex", discover_codex), ("claude", discover_claude)):
        if provider not in config["providers"]:
            continue
        key = provider + "Path"
        path = Path(config[key])
        if path.is_file():
            continue
        bundled = False
        if provider == "codex":
            bundled = path in [root / name / "Contents/Resources/codex"
                for root in (Path("/Applications"), Path.home() / "Applications")
                for name in ("ChatGPT.app", "Codex.app")]
        else:
            root = Path.home() / "Library/Application Support/Claude/claude-code"
            bundled = path.is_relative_to(root) and path.parts[-4:] == ("claude.app", "Contents", "MacOS", "claude")
        if bundled:
            candidate = discover()
            if Path(candidate).is_file():
                result[key] = candidate
    return result


def local_time_zone() -> str:
    candidates = [os.environ.get("TZ", "")]
    try:
        path = str(Path("/etc/localtime").resolve())
        if "/zoneinfo/" in path:
            candidates.append(path.split("/zoneinfo/", 1)[1])
    except OSError:
        pass
    for name in candidates:
        try:
            ZoneInfo(name)
            return name
        except (ValueError, ZoneInfoNotFoundError):
            pass
    return "UTC"


def defaults(state: Path) -> dict:
    return {"configVersion": 1, "providers": ["claude", "codex"], "timeZone": local_time_zone(), "language": "en",
            "display": {}, "scriptableDirectory": str(SCRIPTABLE_FOLDER),
            "codexPath": shutil.which("codex") or "codex", "claudePath": shutil.which("claude") or "claude",
            "codexbarPath": str(state / "tools/codexbar-0.56.7/codexbar"),
            "codexHome": None, "claudeConfigDir": None,
            "path": os.environ.get("PATH", "/usr/bin:/bin:/usr/local/bin")}


def validate_config(config: dict) -> dict:
    allowed = {"configVersion", "providers", "timeZone", "language", "display", "scriptableDirectory",
               "codexPath", "claudePath", "codexbarPath", "codexHome", "claudeConfigDir", "path"}
    if set(config) - allowed:
        raise ConfigurationError("Configuration contains unknown fields")
    if config.get("configVersion") != 1:
        raise ConfigurationError("Unsupported configVersion; expected 1")
    if config.get("language") not in ("en", "ru"):
        raise ConfigurationError("language must be en or ru")
    providers = config.get("providers")
    if not isinstance(providers, list) or not providers or any(p not in ("claude", "codex") for p in providers) or len(set(providers)) != len(providers):
        raise ConfigurationError("providers must contain claude, codex, or both, without duplicates")
    try:
        ZoneInfo(config["timeZone"])
    except (TypeError, ValueError, ZoneInfoNotFoundError):
        raise ConfigurationError("timeZone must be a valid IANA name, e.g. Europe/Paris") from None
    for key in ("scriptableDirectory", "codexPath", "claudePath", "codexbarPath", "path"):
        if not isinstance(config.get(key), str) or not config[key].strip():
            raise ConfigurationError(key + " must be a nonempty string")
    for key in ("scriptableDirectory", "codexPath", "claudePath", "codexbarPath", "codexHome", "claudeConfigDir"):
        value = config.get(key)
        if value is None and key in ("codexHome", "claudeConfigDir"):
            continue
        if not isinstance(value, str) or not value or "\x00" in value:
            raise ConfigurationError(key + " must be a nonempty path")
        config[key] = str(Path(value).expanduser())
        if key in ("scriptableDirectory", "codexHome", "claudeConfigDir") and not Path(config[key]).is_absolute():
            raise ConfigurationError(key + " must be an absolute path")
    display = config.get("display")
    if not isinstance(display, dict) or set(display) - {"claude", "codex"}:
        raise ConfigurationError("display must use claude/codex keys")
    for pref in display.values():
        if not isinstance(pref, dict) or set(pref) - {"hiddenLimitTerms", "pinnedLimits"}:
            raise ConfigurationError("display supports hiddenLimitTerms and pinnedLimits")
        hidden = pref.get("hiddenLimitTerms", [])
        if not isinstance(hidden, list) or any(not isinstance(x, str) or not x.strip() or len(x) > 120 for x in hidden):
            raise ConfigurationError("hiddenLimitTerms must be a list of nonempty strings")
        pins = pref.get("pinnedLimits", [])
        if not isinstance(pins, list) or len(pins) > 10:
            raise ConfigurationError("pinnedLimits must be a list of at most 10 limits")
        ids = set()
        for pin in pins:
            if not isinstance(pin, dict) or set(pin) - {"id", "title", "windowMinutes"} or any(not isinstance(pin.get(k), str) or not pin[k].strip() or len(pin[k]) > 120 for k in ("id", "title")):
                raise ConfigurationError("Each pinned limit needs an id and title")
            minutes = pin.get("windowMinutes")
            if minutes is not None and (type(minutes) is not int or minutes <= 0):
                raise ConfigurationError("windowMinutes must be a positive integer")
            if pin["id"] in ids:
                raise ConfigurationError("Duplicate pinned limit id")
            ids.add(pin["id"])
    return config


def read_config(state: Path) -> dict:
    config = defaults(state)
    path = state / "config.json"
    if path.exists():
        saved = json.loads(path.read_text())
        if not isinstance(saved, dict):
            raise ConfigurationError("config.json must contain a JSON object")
        # Earlier versions had a Russian-only UI; preserve it unless explicitly changed.
        saved.setdefault("language", "ru")
        # Preserve the pre-public personal build when upgrading; new installs show all limits.
        if "configVersion" not in saved:
            saved.setdefault("display", {
                "claude": {"hiddenLimitTerms": ["sonnet"], "pinnedLimits": [
                    {"id": "claude-weekly-scoped-fable", "title": "Fable", "windowMinutes": 10080}]},
                "codex": {"hiddenLimitTerms": ["spark", "codex_bengalfox"]}})
        config.update(saved)
    return validate_config(config)


def update_config(config: dict, *, overrides: dict | None = None, providers=None, time_zone=None, language=None,
                  hidden_limits=None, show_all=False, scriptable_directory=None) -> dict:
    result = copy.deepcopy(config)
    if overrides is not None:
        if not isinstance(overrides, dict) or set(overrides) - set(config):
            raise ConfigurationError("Configuration file contains unknown fields")
        result.update(overrides)
        validate_config(result)
    if providers is not None:
        result["providers"] = [p.strip() for p in providers.split(",")]
    if time_zone:
        result["timeZone"] = time_zone
    if language is not None:
        result["language"] = language
    if scriptable_directory:
        result["scriptableDirectory"] = str(Path(scriptable_directory).expanduser().resolve())
    if show_all:
        for pref in result["display"].values():
            pref["hiddenLimitTerms"] = []
    for value in hidden_limits or []:
        provider, sep, term = value.partition(":")
        if provider not in ("claude", "codex") or not sep or not term.strip():
            raise ConfigurationError("--hide-limit expects provider:term, e.g. codex:spark")
        terms = result["display"].setdefault(provider, {}).setdefault("hiddenLimitTerms", [])
        if term.strip() not in terms:
            terms.append(term.strip())
    return validate_config(result)


def provider_environment(config: dict) -> dict:
    env = dict(os.environ)
    paths = [str(Path(config[key]).parent) for key in ("claudePath", "codexPath") if Path(config[key]).is_absolute()]
    env["PATH"] = os.pathsep.join(paths + [config["path"], "/usr/bin", "/bin", "/usr/local/bin", "/opt/homebrew/bin"])
    env["TZ"] = config["timeZone"]
    for key, name in (("codexHome", "CODEX_HOME"), ("claudeConfigDir", "CLAUDE_CONFIG_DIR")):
        if config.get(key):
            env[name] = config[key]
    if Path(config["claudePath"]).is_absolute():
        env["CLAUDE_CLI_PATH"] = config["claudePath"]
    return env
