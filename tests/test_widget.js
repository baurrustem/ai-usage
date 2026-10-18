const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const U = require('../scriptable/core.js');
const { sample } = require('./fixture.js');
const NOW = Date.parse('2026-09-07T10:00:00Z');

test('zero usage means 100% remaining, missing usage never means zero', () => {
  const s = sample(NOW), p = s.providers[0], w = p.limits[0];
  w.usedPercent = 0; assert.equal(U.pct(w, p.limitsState, NOW), '100%');
  w.usedPercent = null; assert.equal(U.pct(w, p.limitsState, NOW), '—');
});

test('expired reset never invents fresh quota', () => {
  const p = sample(NOW).providers[0], w = p.limits[0];
  w.resetsAt = new Date(NOW - 60000).toISOString();
  assert.equal(U.remaining(w, p.limitsState, NOW), null);
  assert.equal(U.resetText(w, p.limitsState, NOW), 'Ожидается обновление');
  p.limitsState.fetchedAt = new Date(NOW).toISOString();
  assert.equal(U.remaining(w, p.limitsState, NOW), 68);
});

test('sleep and auth failures make old values visibly stale', () => {
  const p = sample(NOW).providers[0];
  assert.equal(U.stale(p.limitsState, NOW), false);
  assert.equal(U.stale(p.limitsState, NOW + 3600000), true);
  assert.equal(U.stale({ ...p.limitsState, state: 'error' }, NOW), true);
});

test('history splits at resets and missing observations', () => {
  const p = sample(NOW).providers[0];
  assert.equal(U.historySegments(p, 'claude:primary', '24h', NOW).length, 4);
  assert.equal(U.historySegments(p, 'claude:secondary', '24h', NOW).length, 1);
  assert.equal(U.historySegments(p, 'unknown', '24h', NOW).length, 0);
});

test('provider parameters and all Codex groups can be selected', () => {
  const options = U.parseOptions('codex;metric=tokens;range=7d;group=special');
  assert.equal(options.metric, 'tokens'); assert.equal(options.range, '7d');
  assert.equal(U.parseOptions('nonsense;range=bad').range, '24h');
  const p = sample(NOW).providers[1];
  p.limits.push({ ...p.limits[0], id: 'special:primary', groupId: 'special' });
  assert.equal(U.selectedLimits(p, options)[0].id, 'special:primary');
  assert.equal(U.selectedLimits(p, { group: 'missing' }).length, 0);
});

test('token dates respect Almaty midnight and absent days remain unknown', () => {
  const midnight = Date.parse('2026-09-07T19:01:00Z');
  assert.equal(U.dayKey(midnight, 'Asia/Almaty'), '2026-09-08');
  const p = sample(NOW).providers[0];
  assert.equal(U.tokenTotal(p, 1, midnight, 'Asia/Almaty').value, null);
  p.tokens.daily = [{ date: '2026-09-08', totalTokens: 0 }];
  assert.equal(U.tokenTotal(p, 1, midnight, 'Asia/Almaty').value, 0);
});

test('schema and malformed data fail closed before rendering', () => {
  assert.throws(() => U.validateSnapshot({ schemaVersion: 2 }));
  const s = sample(NOW); s.providers[0].tokens.daily[0].totalTokens = '123';
  assert.throws(() => U.validateSnapshot(s));
  assert.equal(U.validateSnapshot(sample(NOW)).schemaVersion, 1);
});

test('dashboard escapes source text, embeds valid JS, and has no remote dependencies', () => {
  const s = sample(NOW);
  s.providers[0].name = '</script><script>bad()</script>';
  const html = U.dashboardHTML(s);
  assert.equal((html.match(/<script>/g) || []).length, 1);
  assert(!html.includes('https://'));
  new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);
});

function fakeFiles(data = {}) {
  const files = new Map(Object.entries(data));
  return { files, documentsDirectory: () => '/docs', joinPath: (a, b) => a + '/' + b,
    fileExists: path => files.has(path), readString: path => { if (!files.has(path)) throw new Error('missing'); return files.get(path); },
    fileSize: path => (files.get(path) || '').length / 1024, createDirectory() {},
    writeString: (path, text) => files.set(path, text), remove: path => files.delete(path),
    move: (from, to) => { files.set(to, files.get(from)); files.delete(from); },
    downloadFileFromiCloud: async () => {} };
}
global.Timer = { schedule(ms, repeat, callback) { const id = setTimeout(callback, ms); return { invalidate() { clearTimeout(id); } }; } };

test('corrupt iCloud file falls back to validated local snapshot', async () => {
  const local = fakeFiles({ '/docs/AI Usage/cache.json': JSON.stringify(sample(NOW)) });
  const cloud = fakeFiles({ '/docs/AI Usage/snapshot.json': '{bad json' });
  const info = await U.loadSnapshot(local, cloud);
  assert.equal(info.cached, true); assert.equal(info.snapshot.generatedAt, sample(NOW).generatedAt);
});

test('out-of-order iCloud delivery never rolls back the snapshot', async () => {
  const local = fakeFiles({ '/docs/AI Usage/cache.json': JSON.stringify(sample(NOW)) });
  const cloud = fakeFiles({ '/docs/AI Usage/snapshot.json': JSON.stringify(sample(NOW - 3600000)) });
  const info = await U.loadSnapshot(local, cloud);
  assert.equal(info.cached, true); assert.equal(info.snapshot.generatedAt, sample(NOW).generatedAt);
});

test('iCloud timeout falls back without waiting indefinitely', async () => {
  const local = fakeFiles({ '/docs/AI Usage/cache.json': JSON.stringify(sample(NOW)) });
  const cloud = fakeFiles({ '/docs/AI Usage/snapshot.json': 'placeholder' });
  cloud.downloadFileFromiCloud = () => new Promise(() => {});
  const info = await U.loadSnapshot(local, cloud, 5);
  assert.equal(info.cached, true); assert(info.snapshot);
});

test('first launch shows setup; fresh cloud snapshot updates local cache', async () => {
  const local = fakeFiles(), cloud = fakeFiles();
  assert.equal((await U.loadSnapshot(local, cloud)).snapshot, null);
  cloud.files.set('/docs/AI Usage/snapshot.json', JSON.stringify(sample(NOW)));
  assert.equal((await U.loadSnapshot(local, cloud)).cached, false);
  assert(local.files.has('/docs/AI Usage/cache.json'));
});

// API-level smoke checks. Actual WidgetKit typography is verified separately on iPhone.
class Element {
  constructor() { this.children = []; }
  addText(value) { const e = new Element(); e.text = value; this.children.push(e); return e; }
  addDate(value) { const e = new Element(); e.date = value; this.children.push(e); return e; }
  addStack() { const e = new Element(); this.children.push(e); return e; }
  addImage(value) { const e = new Element(); e.image = value; this.children.push(e); return e; }
  addSpacer() {} setPadding() {} centerAlignContent() {} layoutHorizontally() {} layoutVertically() {} centerAlignImage() {}
  applyRelativeStyle() {} applyFittingContentMode() {} leftAlignImage() {}
}
global.ListWidget = Element;
global.Color = class { constructor(hex, opacity) { this.hex = hex; this.opacity = opacity; } };
global.Size = class { constructor(width, height) { this.width = width; this.height = height; } };
global.Rect = class { constructor(x, y, width, height) { Object.assign(this, {x, y, width, height}); } };
global.Point = class { constructor(x, y) { this.x = x; this.y = y; } };
global.Font = { systemFont: x => x, mediumSystemFont: x => x, boldSystemFont: x => x, semiboldSystemFont: x => x };
global.Device = { isUsingDarkAppearance: () => false };
global.Path = class { move() {} addLine() {} };
global.DrawContext = class { constructor() { this.drawn = []; } setFillColor() {} fillRect() {} setStrokeColor() {} setLineWidth() {} strokePath() {} addPath() {}
  setTextColor() {} setTextAlignedCenter() {} setFont(font) { this.font = font; }
  drawTextInRect(text, rect) { this.drawn.push({text, rect, font:this.font}); } fillEllipse() {} getImage() { return {drawn:this.drawn, size:this.size}; } };

test('every iPhone widget family renders with normal, missing, and expired values', () => {
  for (const family of ['small', 'medium', 'large', 'accessoryCircular', 'accessoryInline', 'accessoryRectangular']) {
    for (const timestamp of [NOW, NOW + 5 * 86400000]) {
      const widget = U.createWidget(sample(NOW), U.parseOptions('claude'), family, {}, timestamp);
      assert(widget.url.includes('scriptName=')); assert(widget.refreshAfterDate instanceof Date);
      assert(U.createWidget(null, U.parseOptions('codex'), family, {}, timestamp));
      const partial = sample(NOW); partial.providers[0].limits = [];
      assert(U.createWidget(partial, U.parseOptions('claude'), family, {}, timestamp));
    }
  }
});

test('overview includes visible groups and Fable without selecting a service', () => {
  const s = require('./fixture.js').completeSample(NOW);
  s.providers[1].limits.push({ ...s.providers[1].limits[0], id: 'new:<unsafe>', groupId: 'new', groupName: '<unsafe>', usedPercent: null });
  const html = U.overviewHTML(s, NOW);
  assert.equal((html.match(/class="quota-row"/g) || []).length, 6);
  assert(html.includes('Fable · Неделя'));
  assert(!html.includes('Codex Spark · 5 часов'));
  assert(html.includes('&lt;unsafe&gt;'));
  assert(!html.includes('<unsafe>'));
  assert(html.includes('<strong>—</strong>'));
  for (const p of s.providers) for (const w of U.displayLimits(p)) assert(html.includes('data-limit="' + w.id.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '"'));
});

function widgetText(element) {
  return [element.text || '', ...(element.image?.drawn || []).map(d => d.text), ...element.children.flatMap(widgetText)].flat().join(' ');
}

test('display preferences preserve Fable values and raw history while hiding Spark and Sonnet', () => {
  const raw = require('./fixture.js').completeSample(NOW), claude = raw.providers[0], codex = raw.providers[1];
  claude.limits.push({ ...claude.limits[2], id:'claude:sonnet', title:'Sonnet', usedPercent:88 });
  Object.assign(codex.limits[2], {id:'codex_bengalfox:primary',groupId:'codex_bengalfox',groupName:null});
  codex.limitHistory.push({id:'codex_bengalfox:primary',points:[]});
  const saved = JSON.stringify(raw);
  let displayed = U.displaySnapshot(raw);
  assert.equal(JSON.stringify(raw), saved);
  assert.equal(displayed.providers[0].limits.find(w=>w.title==='Fable').usedPercent, 21);
  assert(!JSON.stringify(displayed.providers.map(p=>p.limits)).includes('Sonnet'));
  assert.equal(displayed.providers[1].limits.length, 2);
  assert(!displayed.providers[1].limitHistory.some(s=>s.id==='codex_bengalfox:primary'));
  assert.strictEqual(displayed.providers[1].tokens, raw.providers[1].tokens);
  assert.equal(U.selectedLimits(codex,{group:'codex_bengalfox'}).length,0);
  claude.limits = claude.limits.filter(w=>w.id!=='claude-weekly-scoped-fable');
  displayed = U.displaySnapshot(raw);
  const fable = displayed.providers[0].limits.find(w=>w.title==='Fable');
  assert.equal(fable.usedPercent,null);
  assert.equal(U.pct(fable,claude.limitsState,NOW),'—');
  assert.equal(fable.resetsAt,null);
});

test('fresh overall quota cannot renew an expired retained Fable reading', () => {
  const s=sample(NOW),p=s.providers[0];
  p.limitsState.fetchedAt=new Date(NOW).toISOString();
  p.limitHistory.push({id:'claude-weekly-scoped-fable',points:[{
    at:new Date(NOW-3600000).toISOString(),usedPercent:56,
    resetsAt:new Date(NOW-60000).toISOString(),breakBefore:true
  }]});
  const fable=U.displayLimits(p).find(w=>w.id==='claude-weekly-scoped-fable');
  assert.equal(U.pct(fable,p.limitsState,NOW),'—');
  assert.equal(U.widgetResetText(fable,p.limitsState,NOW),'Ожидается обновление');
  assert.equal(p.limitHistory.at(-1).points.length,1);
});

test('token breakdown handles different input/cache semantics without changing totals', () => {
  const s=sample(NOW),claude=s.providers[0],codex=s.providers[1];
  claude.tokens.daily=[{date:'2026-09-07',totalTokens:1000,inputTokens:10,outputTokens:90,cacheReadTokens:800,cacheCreationTokens:100}];
  codex.tokens.daily=[{date:'2026-09-07',totalTokens:1000,inputTokens:910,outputTokens:90,cacheReadTokens:800,cacheCreationTokens:null}];
  assert.deepEqual(U.tokenBreakdown(claude,1,NOW,s.timeZone),{input:10,cacheRead:800,cacheWrite:100,output:90,cachePercent:800/910*100});
  assert.deepEqual(U.tokenBreakdown(codex,1,NOW,s.timeZone),{input:110,cacheRead:800,cacheWrite:null,output:90,cachePercent:800/910*100});
  assert.equal(U.tokenTotal(claude,1,NOW,s.timeZone).value,1000);
  codex.tokens.daily[0].cacheReadTokens=null;
  assert.equal(U.tokenBreakdown(codex,1,NOW,s.timeZone).input,null);
});

test('preview uses a real supplied snapshot and demo data only when requested', () => {
  const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
  const {previewData}=require('../tools/preview_data.js');
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'ai-usage-preview-'));
  try {
    const file=path.join(directory,'snapshot.json'),s=sample(NOW);
    s.providers[0].tokens.daily=[{date:'2026-09-07',totalTokens:123}];
    s.providers[1].tokens.daily=[{date:'2026-09-07',totalTokens:987}];
    fs.writeFileSync(file,JSON.stringify(s));
    const real=previewData(['--snapshot',file]);
    assert.deepEqual(real.snapshot,s);assert(real.caption.startsWith('Данные этого Mac'));
    assert(previewData(['--demo']).caption.startsWith('Demo'));
    assert(previewData(['--demo','--language','ru']).caption.startsWith('Демо'));
    assert.throws(()=>previewData(['--snapshot',file+'-missing']));
  } finally {fs.rmSync(directory,{recursive:true,force:true});}
});


test('quota captions use consistent rows, Almaty time and the retained window own timestamp', () => {
  const p = sample(NOW).providers[0], w = p.limits[1];
  assert.deepEqual(U.quotaCaptionLines(w,p,NOW,'Asia/Almaty'), ['10 сент., 15:00']);
  assert.deepEqual(U.forLanguage('en').quotaCaptionLines(w,p,NOW,'Asia/Almaty'), ['10 Sept, 15:00']);
  assert.deepEqual(U.forLanguage('en').quotaCaptionLines(w,{...p,id:'codex'},NOW,'Asia/Almaty'), ['Resets','10 Sept, 15:00']);
  assert.deepEqual(U.forLanguage('en').quotaCaptionLines({...w,windowMinutes:300},{...p,id:'codex'},NOW,'Asia/Almaty'), ['10 Sept, 15:00']);
  assert.deepEqual(U.quotaCaptionLines({...w,title:'Fable',resetsAt:null},p,NOW,'Asia/Almaty'), ['Время сброса','Не получено']);
  assert.deepEqual(U.quotaCaptionLines({...w,title:'Fable',usedPercent:null,resetsAt:null},p,NOW,'Asia/Almaty'), ['Нет данных','о лимите Fable']);
  const retained = {...w,retained:true,observedAt:new Date(NOW-17*60000).toISOString()};
  assert.deepEqual(U.quotaCaptionLines(retained,p,NOW,'Asia/Almaty'), ['Данные устарели','14:43']);
  retained.observedAt = '2026-09-06T10:00:00Z';
  assert.deepEqual(U.quotaCaptionLines(retained,p,NOW,'Asia/Almaty'), ['Данные устарели','6 сент., 15:00']);
  retained.resetsAt = new Date(NOW-60000).toISOString();
  assert.deepEqual(U.quotaCaptionLines(retained,p,NOW,'Asia/Almaty'), ['Ожидается','обновление']);
});


test('one title indicator covers both services, partial data and local cache', () => {
  const s = require('./fixture.js').completeSample(NOW);
  assert.equal(U.widgetFreshness(s, {}, NOW), 'ok');
  assert.equal(U.widgetFreshness(s, {cached:true}, NOW), 'stale');
  assert.equal(U.widgetFreshness(s, {}, NOW + 20*60000), 'stale');
  s.providers[0].limits[2].resetsAt = null;
  assert.equal(U.widgetFreshness(s, {}, NOW), 'stale');
  s.providers[0].limits[2].resetsAt = new Date(NOW + 3600000).toISOString();
  s.providers[0].tokens.state.fetchedAt = new Date(NOW - 3600000).toISOString();
  assert.equal(U.widgetFreshness(s, {}, NOW), 'stale');
  s.providers[1].activity.state.state = 'error';
  assert.equal(U.widgetFreshness(s, {}, NOW), 'error');
});


test('public defaults show every returned limit without inventing a pinned model', () => {
  const s = require('./fixture.js').publicSample(NOW);
  s.providers[0].limits = s.providers[0].limits.slice(0, 2);
  s.providers[0].limits.push({...s.providers[0].limits[1],id:'claude:sonnet',title:'Sonnet',slot:'extra'});
  const shown = U.displaySnapshot(U.validateSnapshot(s));
  assert(shown.providers[0].limits.some(w=>w.title==='Sonnet'));
  assert(!shown.providers[0].limits.some(w=>w.title==='Fable'));
  assert(shown.providers[1].limits.some(w=>w.groupId==='spark'));
  assert.equal(shown.providers[1].limits.length, s.providers[1].limits.length);
  assert(require('../tools/preview_data').previewData([]).caption.startsWith('Demo'));
  assert.throws(()=>require('../tools/preview_data').previewData(['--demo','--live']));
});

test('a single configured service works in every widget size with default parameters', () => {
  const s = require('./fixture.js').publicSample(NOW);
  for (const provider of s.providers) {
    const single = {...s,providers:[provider]};
    assert.equal(U.validateSnapshot(single),single);
    for (const family of ['small','medium','large','accessoryCircular','accessoryInline','accessoryRectangular']) {
      const widget=U.createWidget(single,U.parseOptions('codex'),family,{},NOW);
      assert(widget);
      assert(!widgetText(widget).includes('Открой Scriptable для настройки'));
    }
    new vm.Script(U.dashboardHTML(single).match(/<script>([\s\S]*)<\/script>/)[1]);
  }
  assert.throws(()=>U.validateSnapshot({...s,providers:[]}));
  assert.throws(()=>U.validateSnapshot({...s,providers:[s.providers[0],s.providers[0]]}));
});

test('configured pins retain only their exact history and hidden terms take precedence', () => {
  const s=require('./fixture.js').publicSample(NOW),p=s.providers[0];
  p.display={pinnedLimits:[{id:'custom:model',title:'Custom',windowMinutes:10080}],hiddenLimitTerms:[]};
  p.limitHistory.push({id:'another:model',points:[{at:new Date(NOW-60000).toISOString(),usedPercent:7,resetsAt:new Date(NOW+60000).toISOString()}]});
  assert.equal(U.displayLimits(p).find(w=>w.id==='custom:model').usedPercent,null);
  p.limitHistory.push({...p.limitHistory.at(-1),id:'custom:model'});
  const retained=U.displayLimits(p).find(w=>w.id==='custom:model');
  assert.equal(retained.usedPercent,7);assert.equal(retained.retained,true);
  p.display.hiddenLimitTerms=['CUSTOM'];
  assert(!U.displayLimits(p).some(w=>w.id==='custom:model'));
  p.display.hiddenLimitTerms=[5];assert.throws(()=>U.validateSnapshot(s),/invalid_display/);
});

test('localized dates, stale and reset-due captions preserve values and isolate locales', () => {
  const en=U.forLanguage('en'), ru=U.forLanguage('ru'),p=sample(NOW).providers[0],w=p.limits[1];
  assert.equal(en.readingTime('2026-09-08T10:00:00Z',NOW,'Asia/Almaty'),'8 Sept, 15:00');
  assert.equal(ru.readingTime('2026-09-08T10:00:00Z',NOW,'Asia/Almaty'),'8 сент., 15:00');
  assert.equal(en.ageText('2026-09-07T09:55:00Z',NOW),'5m ago');
  assert.equal(ru.ageText('2026-09-07T09:55:00Z',NOW),'5 мин назад');
  assert.deepEqual(en.quotaCaptionLines({...w,resetsAt:null},p,NOW,'Asia/Almaty'),['Reset time','Unavailable']);
  assert.deepEqual(en.quotaCaptionLines({...w,retained:true,observedAt:'2026-09-07T09:00:00Z'},p,NOW,'Asia/Almaty'),['Stale data','14:00']);
  assert.deepEqual(en.quotaCaptionLines({...w,resetsAt:'2026-09-07T09:59:00Z'},p,NOW,'Asia/Almaty'),['Awaiting','update']);
  assert.equal(en.pct(w,p.limitsState,NOW),ru.pct(w,p.limitsState,NOW));
  assert.equal(en.windowLabel({windowMinutes:60}),'1 hour');
  assert.equal(en.tr('constructor'),'constructor');
});

function renderDashboardForTest(snapshot, language='en', info={}) {
  const html=U.dashboardHTML(snapshot,info,'codex',language);
  const elements=new Map();
  const root={innerHTML:'',style:{setProperty(){}},
    querySelector(selector) { if(!elements.has(selector))elements.set(selector,{});return elements.get(selector); },
    querySelectorAll() {return [];} };
  const context={document:{getElementById:()=>root},window:{},setInterval(){},console};
  vm.runInNewContext(html.match(/<script>([\s\S]*)<\/script>/)[1],context);
  return {html,body:root.innerHTML,root,context};
}

test('English detail screen executes translated markup including source errors and setup', () => {
  const snapshot=require('./fixture.js').completeSample(NOW);
  snapshot.language='en';
  for(const p of snapshot.providers) {
    for(const state of [p.limitsState,p.tokens.state,p.activity.state]) {
      state.state='error';state.code='auth';state.message='Требуется повторный вход на Mac';
    }
  }
  const page=renderDashboardForTest(snapshot,'en',{cached:true,reason:'Показаны последние сохранённые данные'});
  const visible=page.body.replace(/<[^>]*>/g,' ');
  assert(!/[А-Яа-яЁё]/.test(visible),visible);
  for(const label of ['Subscription limits','History & activity','Token breakdown','Uncached input','Cache reads','Prompts & sessions','Sign in again on Mac','Sync status','Showing the last saved data']) assert(visible.includes(label),label);
  page.root.querySelector('#provider').onchange({target:{value:'claude'}});
  assert(page.root.innerHTML.includes('Cache writes'));
  assert(!/[А-Яа-яЁё]/.test(page.root.innerHTML.replace(/<[^>]*>/g,' ')));
  assert(page.html.includes('<html lang="en">'));
  assert(page.body.includes('id="analytics"'));
  assert(page.body.includes('id="connection"'));
  const setup=renderDashboardForTest(null,'en');
  assert(setup.body.includes('class="setup"'));
  assert(setup.body.includes('Enable iCloud Drive'));
  assert(!/[А-Яа-яЁё]/.test(setup.body));
  const russian=renderDashboardForTest(snapshot,'ru');
  assert(russian.body.includes('Лимиты подписок'));
  assert(russian.body.includes('Требуется повторный вход на Mac'));
});

// ---------------------------------------------------------------- 1.1: pace forecast and notifications

function withPace(snapshot, exhaustsInMinutes) {
  const w = snapshot.providers[0].limits[0];
  w.usedPercent = 70;
  w.forecast = exhaustsInMinutes == null
    ? { basis: 'last_hour', ratePerHour: 2, atResetPercent: 74, exhaustsAt: null }
    : { basis: 'last_hour', ratePerHour: 30, atResetPercent: 100, exhaustsAt: new Date(NOW + exhaustsInMinutes * 60000).toISOString() };
  return snapshot;
}

test('forecast line warns only before the reset and stays quiet on stale data', () => {
  const s = withPace(sample(NOW), 60), p = s.providers[0], w = p.limits[0];
  const pace = U.forecastText(w, p.limitsState, NOW, 'Asia/Almaty');
  assert.equal(pace.warn, true);
  assert.match(pace.text, /^При текущем темпе кончится ~\d\d:\d\d$/);
  assert.equal(U.forLanguage('en').forecastText(w, p.limitsState, NOW, 'Asia/Almaty').short.startsWith('runs out ~'), true);
  assert.equal(U.forecastText(w, { ...p.limitsState, state: 'error' }, NOW), null);
  w.forecast.exhaustsAt = new Date(Date.parse(w.resetsAt) + 60000).toISOString();     // after the reset: nothing to warn about
  assert.equal(U.forecastText(w, p.limitsState, NOW), null);
  const calm = withPace(sample(NOW), null).providers[0];
  assert.equal(U.forecastText(calm.limits[0], calm.limitsState, NOW).text, 'При текущем темпе хватит до сброса');
  assert.equal(U.forecastText(sample(NOW).providers[0].limits[0], p.limitsState, NOW), null);   // no forecast field
});

test('notifications: reset when the limit is nearly used, pace warning within 3 hours', () => {
  const kinds = s => U.plannedNotifications(s, NOW).map(n => n.kind).sort();
  assert.deepEqual(kinds(sample(NOW)), []);                       // 32% used, no forecast
  const s = withPace(sample(NOW), 60);
  s.providers[0].limits[0].usedPercent = 85;
  const planned = U.plannedNotifications(s, NOW);
  assert.deepEqual(planned.map(n => n.kind).sort(), ['pace', 'reset']);
  const reset = planned.find(n => n.kind === 'reset');
  assert.equal(reset.at, s.providers[0].limits[0].resetsAt);
  assert.match(reset.title, /^Claude Code · .+: лимит обновился$/);
  assert.deepEqual(kinds(withPace(sample(NOW), 300)), []);        // 5 hours away: no alarm yet
  s.notifications = { enabled: false };
  assert.deepEqual(U.plannedNotifications(s, NOW), []);
});

test('notification ids survive a one-minute reset jitter', () => {
  const a = withPace(sample(NOW), 60), b = withPace(sample(NOW), 60);
  a.providers[0].limits[0].usedPercent = b.providers[0].limits[0].usedPercent = 90;
  b.providers[0].limits[0].resetsAt = new Date(Date.parse(a.providers[0].limits[0].resetsAt) - 60000).toISOString();
  const ids = s => U.plannedNotifications(s, NOW).map(n => n.id).sort();
  assert.deepEqual(ids(a), ids(b));
});

test('notifications: a silent source and a silent Mac are reported once', () => {
  const s = sample(NOW);
  s.generatedAt = new Date(NOW - 120000).toISOString();
  s.providers[0].limitsState = { ...s.providers[0].limitsState, state: 'error', code: 'cli_unavailable', fetchedAt: new Date(NOW - 7 * 3600000).toISOString() };
  const source = U.plannedNotifications(s, NOW).filter(n => n.kind === 'source');
  assert.equal(source.length, 1);
  assert.match(source[0].body, /Источник Claude CLI недоступен.*ai-usage doctor/);
  const old = sample(NOW);
  old.generatedAt = new Date(NOW - 2 * 86400000).toISOString();
  const stale = U.plannedNotifications(old, NOW);
  assert.deepEqual(stale.map(n => n.kind), ['stale']);
  assert.match(U.forLanguage('en').plannedNotifications(old, NOW)[0].body, /ai-usage doctor/);
});

test('delivery schedules each notification once and survives a broken log', async () => {
  const scheduled = [], files = {};
  global.Notification = class { setTriggerDate(d) { this.trigger = d; } async schedule() { scheduled.push(this); } };
  global.FileManager = { local: () => ({ documentsDirectory: () => '/docs', joinPath: (a, b) => a + '/' + b,
    fileExists: p => p in files, readString: p => files[p], writeString: (p, v) => { files[p] = v; } }) };
  try {
    const s = withPace(sample(NOW), 60);
    s.providers[0].limits[0].usedPercent = 85;
    assert.equal(await U.deliverNotifications(s, NOW), 2);
    assert.equal(await U.deliverNotifications(s, NOW), 0);
    assert.ok(scheduled.find(n => n.trigger instanceof Date));
    files['/docs/ai-usage-notified.json'] = '{broken';
    assert.equal(await U.deliverNotifications(s, NOW), 2);
  } finally {
    delete global.Notification; delete global.FileManager;
  }
});

test('detail screen shows the forecast line', () => {
  const T = Date.now();                                            // the detail screen renders with the real clock
  const s = require('./fixture.js').completeSample(T), w = s.providers[0].limits[0];
  w.usedPercent = 70;
  w.forecast = { basis: 'last_hour', ratePerHour: 30, atResetPercent: 100, exhaustsAt: new Date(T + 3600000).toISOString() };
  const page = renderDashboardForTest(s, 'ru');
  assert(page.body.includes('class="reset warn"'));
  assert(page.body.includes('При текущем темпе кончится'));
  s.language = 'en';
  assert(renderDashboardForTest(s, 'en').body.includes('At this pace it runs out'));
});

// ---------------------------------------------------------------- 1.1 design: package cards

const flattenWidget = e => [e, ...e.children.flatMap(flattenWidget)];
const drawnTexts = widget => flattenWidget(widget).flatMap(e => e.image?.drawn || []).map(d => d.text);

test('package cards: the riskiest limit leads, other limits follow and overflow is counted', () => {
  const s = require('./fixture.js').completeSample(NOW);                 // Claude: 68 / 42 / 79 left
  const large = U.createWidget(s, U.parseOptions('codex'), 'large', {}, NOW);
  const claudeLead = U.bindingLimit(U.displaySnapshot(s).providers[0], NOW);
  assert.equal(claudeLead.id, 'claude:secondary');
  const texts = drawnTexts(large);
  assert(texts.includes('42%'));
  assert(texts.some(t => /5 часов 68% · Fable · Неделя 79%/.test(t)), 'a short card lists the other limits in its footer');
  const single = { ...s, providers: [s.providers[0]] };                  // one service: room for every limit
  const one = drawnTexts(U.createWidget(single, U.parseOptions('claude'), 'large', {}, NOW));
  for (const value of ['42%', '68%', '79%']) assert(one.includes(value), value);
  assert(one.includes('Fable · Неделя'));
  const p = s.providers[1];
  for (let i = 0; i < 8; i++) p.limits.push({ ...p.limits[0], id: 'extra:' + i, groupId: 'extra' + i });
  assert(drawnTexts(U.createWidget(s, U.parseOptions('codex'), 'medium', {}, NOW)).some(t => /\+\d+ в подробностях/.test(t)));
  const atRisk = withPace(sample(NOW), 60);                             // a warned limit leads even with more left
  assert.equal(U.bindingLimit(atRisk.providers[0], NOW).id, 'claude:primary');
});

test('percentages are drawn inside their canvas at every phone width, including 0, 100 and missing', () => {
  const snapshot = sample(NOW), p = snapshot.providers[0];
  for (const screenWidth of [320, 375, 390, 440]) {
    global.Device.screenSize = () => ({ width: screenWidth });
    for (const used of [26, 0, 100, null]) {
      p.limits[0].usedPercent = used;
      for (const family of ['small', 'medium', 'large']) {
        const widget = U.createWidget(snapshot, U.parseOptions('claude'), family, {}, NOW);
        const elements = flattenWidget(widget), images = elements.filter(e => e.image);
        assert(!elements.some(e => typeof e.text === 'string' && /^\d+%$/.test(e.text)), 'no native percentage text');
        for (const image of images) {
          assert.equal(image.imageSize.width, image.image.size.width);
          for (const d of image.image.drawn) {
            assert(d.rect.x >= 0 && d.rect.x + d.rect.width <= image.image.size.width + 0.5, family + ' x ' + d.text);
            assert(d.rect.y >= 0 && d.rect.y + d.rect.height <= image.image.size.height + 0.5, family + ' y ' + d.text);
          }
        }
        const texts = images.flatMap(e => e.image.drawn).map(d => d.text);
        if (used === 100) assert(texts.includes('0%'));
        if (used === null && family !== 'small') assert(texts.some(t => /^\d+%$/.test(t)));
        const big = images.flatMap(e => e.image.drawn).find(d => /^(\d+%|—)$/.test(d.text));
        assert(big.font >= 44, 'the lead value is display-sized');
      }
    }
  }
  delete global.Device.screenSize;
});

test('verdicts: runs out, lasts until the reset, renews, and stale data drains the card', () => {
  const warn = withPace(sample(NOW), 60), p = warn.providers[0];
  let v = U.packageVerdict(p.limits[0], p, NOW, 'Asia/Almaty');
  assert.equal(v.mood, 'warn'); assert.match(v.text, /^Кончится ~\d\d:\d\d$/); assert.match(v.detail, /без лимита до \d\d:\d\d$/);
  assert(v.fraction > 0 && v.fraction < 1);
  const calm = withPace(sample(NOW), null).providers[0];
  v = U.packageVerdict(calm.limits[0], calm, NOW, 'Asia/Almaty');
  assert.equal(v.mood, 'ok'); assert.match(v.text, /^Хватит до /); assert.match(v.detail, /к сбросу останется ~26%/);
  const plain = sample(NOW).providers[0];
  v = U.packageVerdict(plain.limits[0], plain, NOW, 'Asia/Almaty');
  assert.equal(v.mood, 'plain'); assert.match(v.text, /^Обновится /); assert.match(v.detail, /^прогноза пока нет · через 1 ч 50 мин$/);
  const far = sample(NOW).providers[0];
  assert.match(U.packageVerdict(far.limits[1], far, NOW, 'Asia/Almaty').detail, /^прогноз только на 6 ч · через 3 дн/); assert.equal(v.fraction, null);
  const s = sample(NOW); s.providers[0].limitsState = { ...s.providers[0].limitsState, state: 'error', code: 'auth' };
  const widget = U.createWidget(s, U.parseOptions('claude'), 'medium', {}, NOW);
  assert(drawnTexts(widget).some(t => t.startsWith('Данные устарели · ')));
  assert.equal(widget.backgroundColor.hex, flattenWidget(widget).find(e => e.cornerRadius !== undefined).backgroundColor.hex);
  assert.notEqual(widget.backgroundColor.hex, 'C2512B');
  assert.match(U.forLanguage('en').packageVerdict(warn.providers[0].limits[0], warn.providers[0], NOW, 'Asia/Almaty').detail, /without quota until/);
});

test('cards carry today tokens, prompts and Codex reset credits, with stale markers', () => {
  const s = sample(NOW);
  for (const family of ['small', 'medium', 'large']) assert(drawnTexts(U.createWidget(s, U.parseOptions('codex'), family, {}, NOW)).some(t => /Сбросов: 3/.test(t)), family);
  const single = { ...s, providers: [s.providers[0]] };
  s.providers[0].tokens.daily = [{ date: '2026-09-07', totalTokens: 1000 }, { date: '2026-09-09', totalTokens: 9000 }];
  let footer = drawnTexts(U.createWidget(single, U.parseOptions('claude'), 'large', {}, NOW)).find(t => t.includes('токенов сегодня'));
  assert.match(footer, /токенов сегодня: 1K/);
  assert.match(footer, /промптов: 12/);
  s.providers[0].tokens.state.state = 'error';
  footer = drawnTexts(U.createWidget(single, U.parseOptions('claude'), 'large', {}, NOW)).find(t => t.includes('токенов сегодня'));
  assert.match(footer, /токенов сегодня: 1K\*/);
  s.providers[1].limitsState.state = 'error';
  assert(drawnTexts(U.createWidget(s, U.parseOptions('codex'), 'large', {}, NOW)).some(t => /Сбросов: 3\*/.test(t)));
});

test('reset credits never become percentages and track zero, unavailable, stale and expiry', () => {
  const snapshot = sample(NOW);
  const html = U.overviewHTML(snapshot, NOW);
  assert.match(html, /Сбросы<\/span><strong>3<\/strong>/);
  assert(html.includes('Один из сбросов истекает'));
  assert.equal((html.match(/class="reset-credits"/g) || []).length, 1);
  const s = sample(NOW), p = s.providers[1];
  p.resetCredits.availableCount = 0; assert.equal(U.resetCreditInfo(p, NOW).value, '0');
  p.resetCredits = null; assert.equal(U.resetCreditInfo(p, NOW).value, '—');
  delete p.resetCredits; assert.equal(U.validateSnapshot(s), s); assert.equal(U.resetCreditInfo(p, NOW).value, '—');
  p.resetCredits = { availableCount: 3, nextExpiresAt: new Date(NOW + 60000).toISOString() };
  p.limitsState.state = 'error';
  assert.deepEqual(U.resetCreditInfo(p, NOW), { value: '3', outdated: true, note: 'Данные устарели' });
  assert.equal(U.resetCreditInfo(p, NOW + 60000).note, 'Ожидается обновление');
  p.limitsState = { ...p.limitsState, state: 'ok', fetchedAt: new Date(NOW + 60000).toISOString() };
  p.resetCredits = { availableCount: 2, nextExpiresAt: null }; assert.equal(U.resetCreditInfo(p, NOW + 60000).value, '2');
  for (const value of [-1, 1.5, '3', true]) { p.resetCredits.availableCount = value; assert.throws(() => U.validateSnapshot(s), /invalid_reset_credits/); }
});

test('a retained Fable reading keeps its own age and is marked on the card', () => {
  const s = sample(NOW), p = s.providers[0];
  const observedAt = new Date(NOW - 10 * 60000).toISOString();
  p.limitHistory.push({ id: 'claude-weekly-scoped-fable', points: [{ at: observedAt, usedPercent: 56, resetsAt: new Date(NOW + 3600000).toISOString(), breakBefore: true }] });
  const saved = JSON.stringify(s);
  const fable = U.displaySnapshot(s).providers[0].limits.find(w => w.id === 'claude-weekly-scoped-fable');
  assert.equal(U.pct(fable, p.limitsState, NOW), '44%');
  assert.equal(U.stale(U.limitState(fable, p.limitsState), NOW), true);
  assert.equal(JSON.stringify(s), saved);
  const texts = drawnTexts(U.createWidget({ ...s, providers: [p] }, U.parseOptions('claude'), 'large', {}, NOW));
  assert(texts.includes('Fable · Неделя *')); assert(texts.includes('44%'));
  assert(U.overviewHTML(s, NOW).includes('Часть лимитов не обновилась'));
});

test('activity totals deduplicate sessions across days and distinguish absent from zero', () => {
  const s = sample(NOW), p = s.providers[0];
  p.activity.daily = [{ date: '2026-09-06', prompts: 3, sessionIds: ['same'] }, { date: '2026-09-07', prompts: 2, sessionIds: ['same', 'other'] },
    { date: '2026-09-08', prompts: 100, sessionIds: ['future'] }];
  assert.deepEqual(U.activityTotal(p, 7, NOW, s.timeZone), { prompts: 5, sessions: 2, activeDays: 2 });
  assert.deepEqual(U.activityTotal(p, 1, NOW, s.timeZone), { prompts: 2, sessions: 2, activeDays: 1 });
  assert(drawnTexts(U.createWidget({ ...s, providers: [p] }, U.parseOptions('claude'), 'large', {}, NOW)).some(t => /промптов: 2/.test(t)));
  p.activity.daily = [{ date: '2026-09-07', prompts: 0, sessionIds: [] }];
  assert.deepEqual(U.activityTotal(p, 1, NOW, s.timeZone), { prompts: 0, sessions: 0, activeDays: 0 });
  p.activity.daily[0].prompts = '2'; assert.throws(() => U.validateSnapshot(s), /invalid_activity/);
  delete p.activity; assert(U.validateSnapshot(s));
  assert.equal(U.activityTotal(p, 1, NOW, s.timeZone).prompts, null);
});

test('English widgets translate every size and keep the language in detail links', () => {
  const snapshot = withPace(require('./fixture.js').completeSample(NOW), 60);
  snapshot.language = 'en';
  for (const family of ['small', 'medium', 'large', 'accessoryCircular', 'accessoryInline', 'accessoryRectangular']) {
    const widget = U.createWidget(snapshot, U.parseOptions('codex'), family, {}, NOW);
    const content = widgetText(widget);
    assert(!/[А-Яа-яЁё]/.test(content), family + ': ' + content);
    assert(widget.url.includes('&lang=en'));
    if (family === 'large') for (const label of ['Claude Code', 'Codex', 'left · ', ' limit', 'Runs out', 'without quota until', 'Resets: ']) assert(content.includes(label), label);
  }
  const legacy = { ...snapshot }; delete legacy.language;
  assert(widgetText(U.createWidget(legacy, U.parseOptions('codex'), 'large', {}, NOW)).includes('осталось'));
  assert(widgetText(U.createWidget(snapshot, U.parseOptions('codex;lang=ru'), 'large', {}, NOW)).includes('Кончится ~'));
  assert.equal(U.parseOptions('lang=bad').language, null);
  assert.throws(() => U.validateSnapshot({ ...snapshot, language: 'bad' }), /invalid_language/);
});
