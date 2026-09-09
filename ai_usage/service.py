from __future__ import annotations

import asyncio
import fcntl
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from .common import PROVIDERS, ProviderError, atomic_json, now_iso
from .config import provider_environment
from .providers import fetch_activity, fetch_claude, fetch_codex, fetch_tokens
from .store import Store

LOG = logging.getLogger("ai_usage")


def configure_logging(state: Path):
    state.mkdir(parents=True, exist_ok=True, mode=0o700)
    handler = RotatingFileHandler(state / "collector.log", maxBytes=512_000, backupCount=2, encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    LOG.setLevel(logging.INFO)
    LOG.addHandler(handler)


async def collect_sources(config, store, *, fetchers=None, clock=now_iso):
    env = provider_environment(config)
    enabled = config.get("providers", list(PROVIDERS))
    if fetchers is None:
        fetchers = {
            ("codex", "limits"): lambda at: fetch_codex(config["codexPath"], at, env),
            ("claude", "limits"): lambda at: fetch_claude(config["codexbarPath"], at, env),
            **{(provider, "tokens"): (lambda at, p=provider: fetch_tokens(config["codexbarPath"], p, at, env)) for provider in PROVIDERS},
            **{(provider, "activity"): (lambda at, p=provider: fetch_activity(p, env)) for provider in PROVIDERS},
        }
    fetchers = {key: action for key, action in fetchers.items() if key[0] in enabled}

    async def fetch(provider, kind, action):
        for attempt in range(2):
            at = clock()
            try:
                data = await action(at)
                store.success(provider, kind, data, at)
                LOG.info("%s %s ok", provider, kind)
                return True
            except ProviderError as error:
                if attempt == 0 and (provider, kind) != ("claude", "limits") and error.code in ("timeout", "process_failed"):
                    await asyncio.sleep(2)
                    continue
                store.failure(provider, kind, error, at)
                LOG.warning("%s %s %s", provider, kind, error.code)
                return False
            except Exception:
                # Provider diagnostics can contain credentials, emails and transcript text.
                store.failure(provider, kind, ProviderError("invalid_data"), at)
                LOG.error("%s %s invalid_data", provider, kind)
                return False

    # CodexBar cost scanning has shared caches. Serialize those two calls.
    async def tokens():
        values = []
        for provider in PROVIDERS:
            key = (provider, "tokens")
            if key in fetchers:
                values.append(await fetch(*key, fetchers[key]))
        return values

    limit_jobs = [fetch(p, k, action) for (p, k), action in fetchers.items() if k != "tokens"]
    result = await asyncio.gather(*limit_jobs, tokens())
    return all(x for item in result for x in (item if isinstance(item, list) else [item]))


def publish(snapshot: dict, state: Path, scriptable_directory: Path) -> dict:
    atomic_json(state / "snapshot.json", snapshot)
    # Do not manufacture a fake iCloud container before Scriptable creates it.
    if not scriptable_directory.is_dir():
        return {"state": "waiting_for_icloud", "message": "Open Scriptable on iPhone and enable iCloud Drive"}
    destination = scriptable_directory / "AI Usage/snapshot.json"
    try:
        atomic_json(destination, snapshot)
    except OSError:
        return {"state": "error", "message": "Could not write to iCloud Drive"}
    return {"state": "written", "message": "Written to iCloud Drive; iCloud controls delivery to iPhone"}


def sync_scripts(source: Path, scriptable_directory: Path):
    from .common import atomic_write
    if not scriptable_directory.is_dir():
        return False
    content = bundle_script(source)
    target = scriptable_directory / "AI Usage.js"
    if not target.exists() or target.read_text(encoding="utf-8") != content:
        atomic_write(target, content)
    return True


def bundle_script(source: Path) -> str:
    core = (source / "core.js").read_text(encoding="utf-8")
    return "// Variables used by Scriptable.\n// icon-color: teal; icon-glyph: chart-pie;\n" + \
        core.removesuffix("module.exports = AIUsage;\n") + "\nawait AIUsage.run();\n"


def collect(state: Path, config: dict) -> dict:
    state.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (state / "collector.lock").open("w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return {"state": "already_running"}
        store = Store(state / "usage.sqlite3")
        try:
            complete = asyncio.run(collect_sources(config, store))
            now = now_iso()
            store.prune(now)
            snapshot = store.snapshot(now, config["timeZone"], config.get("providers"), config.get("display"), config["language"])
            scriptable = Path(config["scriptableDirectory"]).expanduser()
            script_source = Path(__file__).resolve().parent.parent / "scriptable"
            try:
                sync_scripts(script_source, scriptable)
                publication = publish(snapshot, state, scriptable)
            except OSError:
                atomic_json(state / "snapshot.json", snapshot)
                publication = {"state": "error", "message": "Cannot access the Scriptable directory"}
            status = {"state": "ok" if complete else "partial", "finishedAt": now, "publication": publication,
                      "providers": [{"id": p["id"], "limits": p["limitsState"]["state"], "tokens": p["tokens"]["state"]["state"],
                                     "activity": p["activity"]["state"]["state"]} for p in snapshot["providers"]]}
            atomic_json(state / "status.json", status)
            LOG.info("collection %s publication=%s", status["state"], publication["state"])
            return status
        finally:
            store.close()
