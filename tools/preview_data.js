// Public previews are synthetic by default. Personal data requires explicit --live or --snapshot.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const U = require('../scriptable/core.js');
const { publicSample } = require('../tests/fixture.js');

// Demo only: one session limit running out at the pace of the last hour, one weekly limit with room to spare.
function withDemoForecast(snapshot, now = Date.now()) {
  const [claude, codex] = snapshot.providers;
  Object.assign(claude.limits[0], { usedPercent: 74, forecast: { basis: 'last_hour', ratePerHour: 22, atResetPercent: 100,
    exhaustsAt: new Date(now + 70 * 60000).toISOString() } });
  codex.limits[1].forecast = { basis: 'last_hour', ratePerHour: 0.4, atResetPercent: 61, exhaustsAt: null };
  return snapshot;
}

function previewData(argv = process.argv.slice(2)) {
  const live = argv.includes('--live');
  if (argv.includes('--demo') && (live || argv.includes('--snapshot'))) throw new Error('Choose demo or real data, not both');
  const demo = !live && !argv.includes('--snapshot');
  const index = argv.indexOf('--snapshot');
  const file = index >= 0 ? argv[index + 1] : path.join(os.homedir(), 'Library/Application Support/AI Usage/snapshot.json');
  if (index >= 0 && !file) throw new Error('--snapshot requires a path');
  const snapshot = demo ? withDemoForecast(publicSample()) : U.validateSnapshot(JSON.parse(fs.readFileSync(file, 'utf8')));
  const languageIndex = argv.indexOf('--language');
  const language = languageIndex >= 0 ? argv[languageIndex + 1] : (snapshot.language || 'ru');
  if (!['en','ru'].includes(language)) throw new Error('--language must be en or ru');
  if (languageIndex >= 0) snapshot.language = language;
  const date = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'ru-RU', {timeZone:snapshot.timeZone,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(snapshot.generatedAt));
  return { snapshot, caption: language === 'en' ? (demo ? 'Demo · fictional data' : 'This Mac · snapshot ' + date) : (demo ? 'Демо · вымышленные данные' : 'Данные этого Mac · снимок ' + date) };
}
module.exports = { previewData };
