const fs = require('node:fs');
const U = require('../scriptable/core.js');
const { previewData } = require('./preview_data.js');
const { widgetHTML } = require('./widget_preview.js');
const now = Date.now(), { snapshot:data, caption } = previewData();
const en = data.language === 'en';
const t = (ru, english) => en ? english : ru;
// Widget frames at an iPhone 15 / 16 class width (393 pt); sizes follow scriptable/core.js widgetMetrics.
const metrics = U.widgetMetrics(393);
const frame = (family, dark, provider, label) => {
  const size = family === 'large' ? [metrics.width, metrics.large] : family === 'medium' ? [metrics.width, metrics.medium] : [metrics.small, metrics.small];
  return '<figure><div class="widget" style="width:' + size[0] + 'px;height:' + size[1] + 'px">' +
    widgetHTML(data, now, 393, dark, family, provider) + '</div><figcaption>' + label + '</figcaption></figure>';
};
const rows = [
  [frame('large', false, 'codex', t('Большой · светлая тема', 'Large · light')), frame('large', true, 'codex', t('Большой · тёмная тема', 'Large · dark'))],
  [frame('medium', false, 'claude', t('Средний · Claude', 'Medium · Claude')), frame('medium', true, 'codex', t('Средний · Codex, тёмная', 'Medium · Codex, dark'))],
  [frame('small', false, 'claude', t('Маленький', 'Small')), frame('small', true, 'codex', t('Маленький · тёмная', 'Small · dark'))]
].map(row => '<div class="row">' + row.join('') + '</div>').join('');
const html = '<!doctype html><html lang="' + (en ? 'en' : 'ru') + '"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Usage · ' + t('виджет', 'widget') + '</title><style>body{margin:0;background:#dcd8cf;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#55524c;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding:40px 20px;box-sizing:border-box}.row{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:center;gap:32px}figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:14px}.widget{border-radius:22px;overflow:hidden;box-shadow:0 10px 30px rgba(30,20,10,.12),0 2px 6px rgba(30,20,10,.08)}p,figcaption{font-size:12px;margin:0;text-align:center}a{color:inherit}@media(max-width:420px){body{padding:24px 0}.widget{zoom:.9}}</style><p>' + caption + '</p>' + rows + '<p>' + t('Большая цифра — остаток самого рискованного лимита · полоса — на сколько хватит до сброса', 'Big number: what is left of the riskiest limit · bar: how far it lasts before the reset') + '</p><p><a href="preview.html">' + t('Открыть подробности', 'Open details') + '</a></p></html>';
fs.mkdirSync('artifacts', {recursive:true});
fs.writeFileSync('artifacts/widget-preview.html', html);
