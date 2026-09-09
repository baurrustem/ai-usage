import hashlib
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from check_public import inspect
from release_files import public_files
from build_release import build_release


class ReleaseTests(unittest.TestCase):
    def test_release_is_reproducible_and_excludes_private_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp)
            archive = build_release(ROOT, output)
            first = hashlib.sha256(archive.read_bytes()).hexdigest()
            self.assertEqual(hashlib.sha256(build_release(ROOT, output).read_bytes()).hexdigest(), first)
            with zipfile.ZipFile(archive) as bundle:
                names = bundle.namelist()
                for bad in ('snapshot.json', 'config.json', '.cache/', '.private/', 'artifacts/', 'collector.log', 'CodexBarCLI', 'VERIFICATION.md'):
                    self.assertFalse(any(bad in name for name in names), bad)
                self.assertTrue(any(name.endswith('/AI Usage.js') for name in names))
                self.assertTrue(any(name.endswith('/LICENSE') for name in names))
                self.assertTrue(any(name.endswith('/install.command') for name in names))
                info = next(x for x in bundle.infolist() if x.filename.endswith('/install.command'))
                self.assertTrue((info.external_attr >> 16) & 0o111)
            self.assertIn(first, (output / 'SHA256SUMS').read_text())

    def test_public_preflight_detects_common_secrets_without_echoing_values(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            secret = 'sk-' + 'x' * 30
            (root / 'README.md').write_text('example ' + secret)
            self.assertEqual(inspect(root, check_git=False), [(Path('README.md'), 'API credential')])
            self.assertNotIn(secret, repr(inspect(root, check_git=False)))
            (root / 'README.md').write_text('safe example')
            (root / '.private').mkdir(); (root / '.private/config.json').write_text(secret)
            self.assertEqual(inspect(root, check_git=False), [])
            self.assertEqual(public_files(root), [Path('README.md')])
