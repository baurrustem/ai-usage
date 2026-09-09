// Build a self-contained preview from the same aggregate data as the iPhone widget.
const fs = require('node:fs');
const U = require('../scriptable/core.js');
const { previewData } = require('./preview_data.js');
const { snapshot, caption } = previewData();
fs.mkdirSync('artifacts', { recursive: true });
const html = U.dashboardHTML(snapshot, { cached: false }, 'codex').replace('<main id="root">',
  '<div style="text-align:center;padding:7px;background:#f4f4f4;color:#777;font:10px -apple-system,sans-serif">' + caption + '</div><main id="root">');
fs.writeFileSync('artifacts/preview.html', html);
