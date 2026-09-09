const fs = require('node:fs');
const { previewData } = require('./preview_data.js');
const { widgetHTML } = require('./widget_preview.js');
const now = Date.now(), { snapshot:data, caption } = previewData();
const en = data.language === 'en';
const labelFor = label => en ? ({'Светлая тема':'Light theme','Тёмная тема':'Dark theme','Меньший экран iPhone':'Smaller iPhone'})[label] : label;
const cards = [[440, false, 'Светлая тема'], [440, true, 'Тёмная тема'], [390, false, 'Меньший экран iPhone']].map(([width, dark, label]) =>
  '<figure><div class="widget" style="width:' + (width === 440 ? 380 : 338) + 'px;height:' + (width === 440 ? 396 : 354) + 'px">' + widgetHTML(data, now, width, dark) + '</div><figcaption>' + labelFor(label) + '</figcaption></figure>').join('');
const html = '<!doctype html><html lang="' + (en ? 'en' : 'ru') + '"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Usage · ' + (en ? 'widget' : 'виджет') + '</title><style>body{margin:0;background:#efefed;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#626260;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;padding:40px 20px;box-sizing:border-box}main{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:32px;max-width:1250px}figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:16px}.widget{border-radius:28px;overflow:hidden;box-shadow:0 4px 24px #00000006}p,figcaption{font-size:12px;margin:0;text-align:center}a{color:inherit}@media(max-width:420px){body{padding:24px 0}.widget{zoom:.9}}</style><p>' + caption + '</p><main>' + cards + '</main><p>' + (en ? 'Circles show remaining quota · tokens include cache · activity is for today' : 'Круг — остаток лимита · токены включают кэш · активность за сегодня') + '</p><p><a href="preview.html">' + (en ? 'Open details' : 'Открыть подробности') + '</a></p></html>';
fs.mkdirSync('artifacts', {recursive:true});
fs.writeFileSync('artifacts/widget-preview.html', html);
