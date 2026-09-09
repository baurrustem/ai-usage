#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
ai_usage_python="${AI_USAGE_PYTHON:-}"
if [ -z "$ai_usage_python" ]; then
  for candidate in python3 python3.14 python3.13 python3.12; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys; sys.exit(sys.version_info < (3, 12))' 2>/dev/null; then
      ai_usage_python="$(command -v "$candidate")"
      break
    fi
  done
fi
if [ -z "$ai_usage_python" ] || ! "$ai_usage_python" -c 'import sys; sys.exit(sys.version_info < (3, 12))' 2>/dev/null; then
  echo 'AI Usage requires Python 3.12 or newer. Install it from python.org, then retry.' >&2
  exit 1
fi
exec "$ai_usage_python" -m ai_usage install "$@"
