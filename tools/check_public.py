"""Fail before packaging on common credentials, personal paths, or unexpected Git files.

This is a focused preflight, not a substitute for reviewing a release or GitHub secret scanning.
Only filenames and rule names are printed, never matching values.
"""
import re
import hashlib
import subprocess
import sys
from pathlib import Path

from release_files import ROOT, public_files

RULES = {
    'private key': re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
    'API credential': re.compile(r'\bsk-(?:proj-|ant-api\d+-)?[A-Za-z0-9_-]{24,}\b'),
    'GitHub credential': re.compile(r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b'),
    'personal macOS path': re.compile(r'/Users/(?!example(?:/|\b)|you(?:/|\b)|runner(?:/|\b))[\w.-]+'),
    'personal email': re.compile(r'\b[A-Za-z0-9._%+-]+@(?:gmail\.com|icloud\.com|outlook\.com|yahoo\.com)\b', re.I),
}
# Reviewed synthetic screenshots only; changing an image requires visual review and a new digest.
REVIEWED_IMAGES = {'docs/images/widget-dark.png': '45f3a0140c928db89d7f67100539e1881aa7ced681f33b86b6250ebb0ddd967c', 'docs/images/widget-light.png': 'e4fb2177d31a67d0d9e35cf9546a225bbb0b0701e807fc7e9e3301d1aaec4057'}
FORBIDDEN = {'.cache', '.private', 'artifacts', 'dist', 'node_modules', '__pycache__', '.env', 'config.json', 'snapshot.json', 'status.json', 'auth.json', 'credentials.json'}


def inspect(root=ROOT, *, check_git=True):
    paths = set(public_files(root))
    problems = []
    if check_git and (root / '.git').exists():
        result = subprocess.run(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root, capture_output=True, check=True)
        candidates = {Path(p) for p in result.stdout.decode().split('\0') if p}
        for path in sorted(candidates - paths):
            problems.append((path, 'not in public release manifest'))
        paths |= candidates
    for relative in sorted(paths):
        path = root / relative
        if set(relative.parts) & FORBIDDEN or path.suffix in ('.jsonl', '.sqlite3', '.db', '.log', '.pem', '.key'):
            problems.append((relative, 'private/generated file'))
            continue
        if path.is_symlink():
            problems.append((relative, 'unexpected symlink'))
            continue
        if str(relative) in REVIEWED_IMAGES:
            if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != REVIEWED_IMAGES[str(relative)]:
                problems.append((relative, 'unreviewed screenshot content'))
            continue
        try:
            content = path.read_text(encoding='utf-8')
        except (OSError, UnicodeError):
            problems.append((relative, 'missing or non-text public source'))
            continue
        for name, pattern in RULES.items():
            if pattern.search(content):
                problems.append((relative, name))
    return problems


if __name__ == '__main__':
    failures = inspect()
    for path, reason in failures:
        print(f'{path}: {reason}', file=sys.stderr)
    if failures:
        raise SystemExit(1)
    print(f'Public preflight passed: {len(public_files())} source files; no configured patterns detected.')
