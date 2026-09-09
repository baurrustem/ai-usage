"""Create the one-file script that can be imported into Scriptable."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from ai_usage.common import atomic_write
from ai_usage.service import bundle_script

destination = ROOT / "artifacts/AI Usage.js"
atomic_write(destination, bundle_script(ROOT / "scriptable"))
print(destination)
