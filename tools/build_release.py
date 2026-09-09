"""Build a reproducible, source-only release, plus the one-file Scriptable widget."""
import hashlib
import sys
import zipfile
from pathlib import Path

from check_public import inspect
from release_files import ROOT, public_files
sys.path.insert(0, str(ROOT))
from ai_usage import __version__
from ai_usage.service import bundle_script


def build_release(root=ROOT, output=None):
    failures = inspect(root)
    if failures:
        raise RuntimeError('Public preflight failed: ' + ', '.join(str(p) + ' (' + reason + ')' for p, reason in failures))
    if not (root / 'LICENSE').is_file():
        raise RuntimeError('A LICENSE is required before packaging')
    output = output or root / 'dist'
    output.mkdir(parents=True, exist_ok=True)
    prefix = f'ai-usage-{__version__}'
    widget = bundle_script(root / 'scriptable').encode()
    files = {str(p): (root / p).read_bytes() for p in public_files(root)}
    files['AI Usage.js'] = widget
    archive = output / (prefix + '.zip')
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as bundle:
        for name, content in sorted(files.items()):
            entry = zipfile.ZipInfo(prefix + '/' + name, date_time=(2026, 1, 1, 0, 0, 0))
            entry.create_system = 3
            entry.external_attr = (0o100755 if name == 'install.command' else 0o100644) << 16
            entry.compress_type = zipfile.ZIP_DEFLATED
            bundle.writestr(entry, content)
    (output / 'AI Usage.js').write_bytes(widget)
    sums = [hashlib.sha256(p.read_bytes()).hexdigest() + '  ' + p.name for p in (archive, output / 'AI Usage.js')]
    (output / 'SHA256SUMS').write_text('\n'.join(sums) + '\n')
    return archive


if __name__ == '__main__':
    print(build_release())
