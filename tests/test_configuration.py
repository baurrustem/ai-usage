import asyncio
import copy
import json
import os
import plistlib
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from ai_usage.common import atomic_json
from ai_usage.config import ConfigurationError, defaults, local_time_zone, provider_environment, read_config, update_config
from ai_usage.install import InstallationError, install, uninstall
from ai_usage.service import collect_sources
from ai_usage.store import Store

ROOT = Path(__file__).resolve().parents[1]
NOW = '2026-09-07T10:00:00Z'


class ConfigurationTests(unittest.TestCase):
    def test_neutral_defaults_and_legacy_upgrade(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            self.assertEqual(read_config(state)['display'], {})
            atomic_json(state / 'config.json', {'timeZone': 'Asia/Almaty'})
            migrated = read_config(state)
            self.assertEqual(migrated['timeZone'], 'Asia/Almaty')
            self.assertEqual(migrated['display']['codex']['hiddenLimitTerms'], ['spark', 'codex_bengalfox'])
            migrated = update_config(migrated, overrides={'display': {}}, providers='codex')
            atomic_json(state / 'config.json', migrated)
            self.assertEqual(read_config(state)['display'], {})

    def test_timezone_detection_and_utc_fallback(self):
        with patch.dict(os.environ, {'TZ': 'Europe/Paris'}):
            self.assertEqual(local_time_zone(), 'Europe/Paris')
        with patch.dict(os.environ, {'TZ': 'not/a/zone'}), patch('ai_usage.config.Path.resolve', side_effect=OSError):
            self.assertEqual(local_time_zone(), 'UTC')

    def test_validation_and_literal_filters_do_not_mutate_original(self):
        config = defaults(Path('/tmp/state'))
        before = copy.deepcopy(config)
        updated = update_config(config, providers='codex', hidden_limits=['codex:spark', 'codex:spark'])
        self.assertEqual(config, before)
        self.assertEqual(updated['display']['codex']['hiddenLimitTerms'], ['spark'])
        self.assertEqual(update_config(updated, show_all=True)['display']['codex']['hiddenLimitTerms'], [])
        for values in ({'providers': []}, {'providers': ['codex', 'codex']}, {'timeZone': 'unknown'},
                       {'configVersion': 2}, {'claudePath': 2}, {'display': []},
                       {'display': {'codex': {'hiddenLimitTerms': ['']}}},
                       {'display': {'claude': {'pinnedLimits': [{'id': 'x', 'title': 'X', 'windowMinutes': -1}]}}},
                       {'unknownKey': True}):
            with self.subTest(values=values), self.assertRaises(ConfigurationError):
                update_config(config, overrides=values)
        self.assertEqual(provider_environment(update_config(config, overrides={'codexHome': '/tmp/custom-codex'}))['CODEX_HOME'], '/tmp/custom-codex')

    def test_only_enabled_sources_are_called_and_exported(self):
        with tempfile.TemporaryDirectory() as tmp:
            store = Store(Path(tmp) / 'usage.sqlite3')
            calls = []
            async def good(at):
                calls.append('codex')
                return {'source': 'fixture', 'fetchedAt': at, 'limits': []}
            async def forbidden(at):
                raise AssertionError('disabled provider called')
            config = update_config(defaults(Path(tmp)), providers='codex', hidden_limits=['codex:spark'])
            try:
                self.assertTrue(asyncio.run(collect_sources(config, store, fetchers={('codex','limits'): good, ('claude','limits'): forbidden}, clock=lambda: NOW)))
                self.assertEqual(calls, ['codex'])
                snapshot = store.snapshot(NOW, config['timeZone'], config['providers'], config['display'])
                self.assertEqual([p['id'] for p in snapshot['providers']], ['codex'])
                self.assertEqual(snapshot['providers'][0]['display']['hiddenLimitTerms'], ['spark'])
            finally:
                store.close()

    def test_configure_cli_rejects_invalid_changes_without_replacing_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            cmd = [sys.executable, '-m', 'ai_usage', '--state', tmp, 'configure']
            result = subprocess.run(cmd + ['--providers', 'codex', '--time-zone', 'Europe/Paris'], cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout)
            path = Path(tmp) / 'config.json'; original = path.read_bytes()
            result = subprocess.run(cmd + ['--providers', 'wrong'], cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)
            self.assertEqual(path.read_bytes(), original)
            self.assertIn('providers must contain', result.stdout)


class CleanInstallTests(unittest.TestCase):
    def test_clean_install_update_and_uninstall_without_external_services(self):
        with tempfile.TemporaryDirectory(prefix='ai-usage-install-') as tmp:
            root = Path(tmp); state = root / 'state with spaces'; cloud = root / 'icloud'; cloud.mkdir()
            plist = root / 'LaunchAgents/local.ai-usage.collector.plist'
            binary = root / 'codexbar'; binary.write_text('#!/bin/sh\necho "CodexBar 0.56.7"\n'); binary.chmod(0o755)
            config = update_config(defaults(state), providers='codex', time_zone='Europe/Paris', scriptable_directory=str(cloud))
            with patch('ai_usage.install.platform.system', return_value='Darwin'), \
                 patch('ai_usage.install.plist_path', return_value=plist), \
                 patch('ai_usage.install.fetch_codexbar', return_value=binary), \
                 patch('ai_usage.install.discover_codex', return_value='/test/codex'), \
                 patch('ai_usage.install.discover_claude') as claude, \
                 patch('ai_usage.install.launchctl', return_value=subprocess.CompletedProcess([], 0)) as launch:
                result = install(state, config=config, start=False)
                self.assertTrue(result['installed']); self.assertFalse(result['started'])
                self.assertFalse(plist.exists()); launch.assert_not_called(); claude.assert_not_called()
                self.assertTrue((state / 'app/ai_usage/__main__.py').is_file())
                self.assertTrue((state / 'app/LICENSE').is_file())
                self.assertIn('await AIUsage.run();', (cloud / 'AI Usage.js').read_text())
                launcher = state / 'bin/ai-usage'
                probe = subprocess.run([str(launcher), '--help'], capture_output=True, text=True)
                self.assertEqual(probe.returncode, 0, probe.stderr)
                history = state / 'usage.sqlite3'; history.write_bytes(b'retained history')
                saved = read_config(state); saved['display']={'codex': {'hiddenLimitTerms':['spark']}}; atomic_json(state / 'config.json', saved)
                install(state, start=True)
                agent = plistlib.loads(plist.read_bytes())
                self.assertEqual(agent['StartInterval'], 300)
                self.assertEqual(agent['ProgramArguments'][-2:], [str(state), 'collect'])
                self.assertEqual(read_config(state)['display'], saved['display'])
                uninstall(state)
                self.assertFalse(plist.exists()); self.assertFalse((state / 'app').exists())
                self.assertEqual(history.read_bytes(), b'retained history')
                self.assertTrue((cloud / 'AI Usage.js').exists())

    def test_no_start_and_uninstall_do_not_touch_another_states_agent(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); state = root / 'test-state'; plist = root / 'agent.plist'
            original = plistlib.dumps({'ProgramArguments': ['python3','-m','ai_usage','--state',str(root/'other-state'),'collect']})
            plist.write_bytes(original)
            with patch('ai_usage.install.platform.system', return_value='Darwin'), patch('ai_usage.install.plist_path', return_value=plist), patch('ai_usage.install.launchctl') as launch:
                with self.assertRaises(InstallationError):
                    install(state)
                uninstall(state)
                self.assertEqual(plist.read_bytes(), original)
                launch.assert_not_called()


class LanguageTests(unittest.TestCase):
    def test_english_default_russian_upgrade_and_explicit_switch(self):
        with tempfile.TemporaryDirectory() as tmp:
            state=Path(tmp)
            self.assertEqual(read_config(state)['language'],'en')
            old=defaults(state);del old['language']
            atomic_json(state/'config.json',old)
            self.assertEqual(read_config(state)['language'],'ru')
            updated=update_config(read_config(state),language='en')
            atomic_json(state/'config.json',updated)
            self.assertEqual(read_config(state)['language'],'en')
            with self.assertRaises(ConfigurationError):
                update_config(updated,language='fr')
            store=Store(state/'usage.sqlite3')
            try:
                self.assertEqual(store.snapshot(NOW,'UTC',language=updated['language'])['language'],'en')
            finally:
                store.close()

    def test_language_cli_setting_is_saved_without_a_provider_request(self):
        with tempfile.TemporaryDirectory() as tmp:
            command=[sys.executable,'-m','ai_usage','--state',tmp,'configure','--language','ru']
            result=subprocess.run(command,cwd=ROOT,capture_output=True,text=True)
            self.assertEqual(result.returncode,0,result.stdout)
            self.assertEqual(json.loads(result.stdout)['language'],'ru')
            self.assertEqual(read_config(Path(tmp))['language'],'ru')
