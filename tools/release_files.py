"""Explicit public source manifest. Generated/live files are never globbed into releases."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = (
    'docs/images/widget-light.png', 'docs/images/widget-dark.png',
    'README*.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'CHANGELOG.md',
    'CONTRIBUTING.md', 'SECURITY.md', 'Makefile', 'install.command', '.gitignore', '.gitattributes',
    'ai_usage/*.py', 'scriptable/*.js', 'tests/*.py', 'tests/*.js',
    'tools/*.py', 'tools/*.js', 'docs/*.md', 'examples/*.example.json',
    '.github/workflows/*.yml', '.github/ISSUE_TEMPLATE/*.yml', '.github/pull_request_template.md',
)


def public_files(root=ROOT):
    return sorted({p.relative_to(root) for pattern in PATTERNS for p in root.glob(pattern) if p.is_file() and not p.is_symlink()})
