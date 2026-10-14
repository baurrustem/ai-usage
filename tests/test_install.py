import io
import subprocess
import tarfile
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from ai_usage.common import classify_error
from ai_usage.config import discover_claude, discover_codex, provider_environment, defaults, resolve_provider_tools
from ai_usage.install import extract_release, InstallationError
from ai_usage.service import bundle_script, sync_scripts


class InstallationTests(unittest.TestCase):
    def test_missing_bundled_tools_recovered_without_overriding_custom_paths(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            tool = root / 'new-cli'; tool.touch()
            config = defaults(root)
            config['codexPath'] = '/Applications/ChatGPT.app/Contents/Resources/codex'
            config['claudePath'] = str(root / 'Library/Application Support/Claude/claude-code/old/claude.app/Contents/MacOS/claude')
            with patch('ai_usage.config.Path.home', return_value=root), \
                 patch('ai_usage.config.discover_codex', return_value=str(tool)) as codex, \
                 patch('ai_usage.config.discover_claude', return_value=str(tool)) as claude:
                result = resolve_provider_tools(config)
                self.assertEqual(result['codexPath'], str(tool))
                self.assertEqual(result['claudePath'], str(tool))
                self.assertNotEqual(result, config)
                codex.reset_mock(); claude.reset_mock()
                config['codexPath'] = '/custom/missing-codex'
                config['claudePath'] = str(tool)
                self.assertEqual(resolve_provider_tools(config), config)
                codex.assert_not_called(); claude.assert_not_called()

    def test_newest_available_codex_cli_is_discovered_for_fresh_install(self):
        def run(args, **kwargs):
            version = '0.153.1' if 'ChatGPT.app' in args[0] else '0.122.0'
            return subprocess.CompletedProcess(args, 0, 'codex-cli ' + version, '')
        with patch('ai_usage.config.shutil.which', return_value='/test/codex'), \
             patch('ai_usage.config.Path.is_file', return_value=True), \
             patch('ai_usage.config.subprocess.run', side_effect=run):
            self.assertIn('ChatGPT.app/Contents/Resources/codex', discover_codex())

    def test_release_launcher_symlink_and_archive_escape(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            archive = root / 'release.tar.gz'
            with tarfile.open(archive, 'w:gz') as tar:
                binary = tarfile.TarInfo('CodexBarCLI'); binary.size = 5
                tar.addfile(binary, io.BytesIO(b'hello'))
                link = tarfile.TarInfo('codexbar'); link.type = tarfile.SYMTYPE; link.linkname = 'CodexBarCLI'
                tar.addfile(link)
            target = root / 'out'; target.mkdir()
            extract_release(archive, target)
            self.assertEqual((target / 'codexbar').read_text(), 'hello')
            for name, linkname in [('../escape', None), ('codexbar', '../../outside'), ('other-link', 'CodexBarCLI')]:
                with tarfile.open(archive, 'w:gz') as tar:
                    entry = tarfile.TarInfo(name)
                    if linkname:
                        entry.type = tarfile.SYMTYPE; entry.linkname = linkname
                    tar.addfile(entry)
                with self.assertRaises(InstallationError):
                    extract_release(archive, target)
                self.assertFalse((root / 'escape').exists())

    def test_signed_in_cli_preferred_over_newer_desktop_cli(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            desktop = root / 'Library/Application Support/Claude/claude-code/2.1.260/claude.app/Contents/MacOS/claude'
            desktop.parent.mkdir(parents=True); desktop.touch()
            def run(args, **kwargs):
                native = args[0] == str(desktop)
                stdout = ('2.1.260' if native else '2.1.112') if args[-1] == '--version' else ('{"loggedIn":false}' if native else '{"loggedIn":true}')
                return subprocess.CompletedProcess(args, 0, stdout, '')
            with patch('ai_usage.config.Path.home', return_value=root), patch('ai_usage.config.shutil.which', return_value='/test/claude'), patch('ai_usage.config.subprocess.run', side_effect=run):
                self.assertEqual(discover_claude(), '/test/claude')

    def test_explicit_claude_path_and_safe_cli_errors(self):
        config = defaults(Path('/tmp/ai-usage-test'))
        config['claudePath'] = '/test/claude'
        self.assertEqual(provider_environment(config)['CLAUDE_CLI_PATH'], '/test/claude')
        self.assertEqual(classify_error('Claude CLI /usage is still loading usage data.').code, 'loading')
        self.assertEqual(classify_error('No available fetch strategy for claude.').code, 'cli_unavailable')

    def test_self_contained_script_synced_only_to_existing_container(self):
        source = Path(__file__).resolve().parents[1] / 'scriptable'
        script = bundle_script(source)
        self.assertNotIn('module.exports', script)
        self.assertNotIn('importModule(', script)
        self.assertTrue(script.endswith('await AIUsage.run();\n'))
        with tempfile.TemporaryDirectory() as tmp:
            cloud = Path(tmp) / 'cloud'
            self.assertFalse(sync_scripts(source, cloud))
            cloud.mkdir()
            self.assertTrue(sync_scripts(source, cloud))
            self.assertEqual((cloud / 'AI Usage.js').read_text(), script)


if __name__ == '__main__':
    unittest.main()
