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

test('medium and large widgets show additional quotas and report overflow', () => {
  const s = require('./fixture.js').completeSample(NOW);
  for (const family of ['medium', 'large']) {
    const values = widgetText(U.createWidget(s, U.parseOptions('codex'), family, {}, NOW));
    assert(values.includes('Fable · Неделя'));
    assert(!values.includes('Spark'));
    assert(values.includes('79%'));
    assert(!values.includes('53%'));
  }
  const p = s.providers[1];
  for (let i = 0; i < 8; i++) p.limits.push({ ...p.limits[0], id: 'extra:' + i, groupId: 'extra' + i });
  assert(widgetText(U.createWidget(s, U.parseOptions('codex'), 'large', {}, NOW)).includes('+8 в подробностях'));
  assert.equal((U.overviewHTML(s, NOW).match(/class="quota-row"/g) || []).length, 13);
});


test('large widget draws complete quota values with the rings instead of compressible native labels', () => {
  const snapshot = require('./fixture.js').completeSample(NOW);
  Object.assign(snapshot.providers[1].limits[1], { id:'research:primary', groupId:'research', groupName:'Codex Research' });
  const widget = U.createWidget(snapshot, U.parseOptions('codex'), 'large', {}, NOW);
  const flatten = e => [e, ...e.children.flatMap(flatten)];
  const elements = flatten(widget);
  const images = elements.filter(e => e.image);
  const percentages = images.flatMap(e => e.image.drawn).filter(d => /^\d+%$/.test(d.text));
  assert.equal(percentages.length, 5);
  assert(percentages.every(d => d.font >= 16));
  assert(!elements.some(e => typeof e.text === 'string' && /^\d+%$/.test(e.text)));
  assert(images.every(e => e.imageSize.width === e.image.size.width));
  assert.match(widgetText(widget), /Research · 7 дн\./);
  assert.equal(images.filter(e => e.image.drawn.length === 1 && /^\d+%$/.test(e.image.drawn[0].text)).length, 5);
  assert.equal(U.nativeLimitLabel(snapshot.providers[1].limits[1], snapshot.providers[1]), 'Codex Research · Неделя');
});

test('large widget shows local tokens for today, seven and thirty days and marks stale totals', () => {
  const snapshot = sample(NOW), p = snapshot.providers[0];
  p.tokens.daily = [
    { date:'2026-09-09', totalTokens:9000 }, // future rows do not count
    { date:'2026-09-07', totalTokens:1000 },
    { date:'2026-09-06', totalTokens:2000 },
    { date:'2026-08-30', totalTokens:3000 },
  ];
  let content = widgetText(U.createWidget(snapshot, U.parseOptions('claude'), 'large', {}, NOW)).replace(/\s+/g, ' ');
  assert(content.includes('Токены сегодня 1K 7 дней 3K 30 дней 6K'));
  assert(content.includes('По данным этого Mac'));
  assert(content.includes('68%'));
  p.tokens.state.state = 'error';
  content = widgetText(U.createWidget(snapshot, U.parseOptions('claude'), 'large', {}, NOW));
  assert(content.includes('Токены*'));
  assert(content.includes('*Устарело'));
  p.tokens.daily = [];
  content = widgetText(U.createWidget(snapshot, U.parseOptions('claude'), 'large', {}, NOW)).replace(/\s+/g, ' ');
  assert(content.includes('Токены* сегодня — 7 дней — 30 дней —'));
});


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

test('reset credits render on home widgets and details without becoming percentages', () => {
  const snapshot = sample(NOW);
  for (const family of ['small', 'medium', 'large']) {
    const content = widgetText(U.createWidget(snapshot, U.parseOptions('codex'), family, {}, NOW));
    assert.match(content, family === 'large' ? /Сбросы\s+3/ : /Сбросы\s+3/);
  }
  const html = U.overviewHTML(snapshot, NOW);
  assert.match(html, /Сбросы<\/span><strong>3<\/strong>/);
  assert(html.includes('Один из сбросов истекает'));
  assert.equal((html.match(/class="reset-credits"/g) || []).length, 1);
  const root = { innerHTML:'', style:{setProperty(){}}, querySelector(){return {}}, querySelectorAll(){return []} };
  vm.runInNewContext(U.dashboardHTML(snapshot).match(/<script>([\s\S]*)<\/script>/)[1],
    { window:{}, document:{getElementById:()=>root}, setInterval(){}, Date:class extends Date {static now(){return NOW;}} });
  assert(root.innerHTML.includes('Сбросы'));
});

test('reset credits distinguish zero, unavailable, stale and expiry awaiting a fresh reading', () => {
  const s = sample(NOW), p = s.providers[1];
  p.resetCredits.availableCount = 0;
  assert.equal(U.resetCreditInfo(p, NOW).value, '0');
  p.resetCredits = null;
  assert.equal(U.resetCreditInfo(p, NOW).value, '—');
  delete p.resetCredits;
  assert.equal(U.validateSnapshot(s), s); // old schema 1 snapshots remain readable
  assert.equal(U.resetCreditInfo(p, NOW).value, '—');
  p.resetCredits = { availableCount:3, nextExpiresAt:new Date(NOW + 60000).toISOString() };
  p.limitsState.state = 'error';
  assert.deepEqual(U.resetCreditInfo(p, NOW), {value:'3',outdated:true,note:'Данные устарели'});
  assert(widgetText(U.createWidget(s,U.parseOptions('codex'),'large',{},NOW)).includes('Сбросы*'));
  assert.equal(U.resetCreditInfo(p, NOW + 60000).note, 'Ожидается обновление');
  assert.equal(U.resetCreditInfo(p, NOW + 60000).value, '—');
  p.limitsState = {...p.limitsState,state:'ok',fetchedAt:new Date(NOW + 60000).toISOString()};
  p.resetCredits = {availableCount:2,nextExpiresAt:null};
  assert.equal(U.resetCreditInfo(p, NOW + 60000).value, '2');
  for (const value of [-1, 1.5, '3', true]) {
    p.resetCredits.availableCount = value;
    assert.throws(() => U.validateSnapshot(s), /invalid_reset_credits/);
  }
});

test('partial Claude response retains only a real Fable reading with its own age', () => {
  const s = sample(NOW), p = s.providers[0];
  const observedAt = new Date(NOW - 10 * 60000).toISOString();
  p.limits.push({...p.limits[1], id:'claude:sonnet', title:'Sonnet', slot:'extra', usedPercent:9});
  p.limitHistory.push({id:'claude-weekly-scoped-fable',points:[{
    at:observedAt,usedPercent:56,resetsAt:new Date(NOW+3600000).toISOString(),breakBefore:true
  }]});
  const saved = JSON.stringify(s);
  const shown = U.displaySnapshot(s), fable = shown.providers[0].limits.find(w=>w.id==='claude-weekly-scoped-fable');
  assert.equal(U.pct(fable,p.limitsState,NOW),'44%');
  assert.equal(U.limitState(fable,p.limitsState).fetchedAt,observedAt);
  assert.equal(U.stale(U.limitState(fable,p.limitsState),NOW),true);
  assert.equal(U.widgetResetText(fable,p.limitsState,NOW),'Последние данные · 10 мин назад');
  assert.equal(JSON.stringify(s),saved); // presentation never creates quota history points
  assert.deepEqual(U.displaySnapshot(shown),shown);
  for(const family of ['small','medium','large']) {
    const content = widgetText(U.createWidget(s,U.parseOptions('claude'),family,{},NOW));
    assert(content.includes('Fable · Неделя *'));
    assert(content.includes('44%'));
    assert(content.includes(family === 'large' ? 'Данные устарели' : 'Последние данные · 10 мин назад'));
    if (family === 'large') assert(content.includes('14:50'));
  }
  assert(U.overviewHTML(s,NOW).includes('Часть лимитов не обновилась'));
  p.limits.push({...fable,retained:false,observedAt:undefined,usedPercent:60});
  const fresh=U.displayLimits(p).find(w=>w.id===fable.id);
  assert.equal(U.pct(fresh,p.limitsState,NOW),'40%');
  assert(!U.limitLabel(fresh,p).includes('*'));
  assert(!U.overviewHTML(s,NOW).includes('Часть лимитов не обновилась'));
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

test('activity totals deduplicate sessions across days and distinguish absent from zero', () => {
  const s=sample(NOW),p=s.providers[0];
  p.activity.daily=[{date:'2026-09-06',prompts:3,sessionIds:['same']},{date:'2026-09-07',prompts:2,sessionIds:['same','other']},
    {date:'2026-09-08',prompts:100,sessionIds:['future']}];
  assert.deepEqual(U.activityTotal(p,7,NOW,s.timeZone),{prompts:5,sessions:2,activeDays:2});
  assert.deepEqual(U.activityTotal(p,1,NOW,s.timeZone),{prompts:2,sessions:2,activeDays:1});
  const text=widgetText(U.createWidget(s,U.parseOptions('claude'),'large',{},NOW));
  assert.match(text,/Сегодня\s+Промпты\s+2\s+Сессии\s+2/);
  p.activity.daily=[{date:'2026-09-07',prompts:0,sessionIds:[]}];
  assert.deepEqual(U.activityTotal(p,1,NOW,s.timeZone),{prompts:0,sessions:0,activeDays:0});
  p.activity.daily[0].prompts='2';assert.throws(()=>U.validateSnapshot(s),/invalid_activity/);
  delete p.activity;assert(U.validateSnapshot(s));
  assert.equal(U.activityTotal(p,1,NOW,s.timeZone).prompts,null);
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


test('iPhone screenshot regression: full percentages include 0, 100, weekly and retained Fable', () => {
  const snapshot = sample(NOW), p = snapshot.providers[0];
  p.limits[0].usedPercent = 26; p.limits[1].usedPercent = 33;
  p.limitHistory.push({id:'claude-weekly-scoped-fable', points:[{at:new Date(NOW - 17*60000).toISOString(), usedPercent:56, resetsAt:new Date(NOW+86400000).toISOString()}]});
  const flatten = e => [e, ...e.children.flatMap(flatten)];
  for (const screenWidth of [375, 390, 440]) {
    global.Device.screenSize = () => ({width:screenWidth});
    for (const used of [26, 0, 100, null]) {
      p.limits[0].usedPercent = used;
      const widget = U.createWidget(snapshot, U.parseOptions('claude'), 'large', {}, NOW);
      const elements = flatten(widget), images = elements.filter(e => e.image);
      const rings = images.filter(e => e.image.drawn.length === 1 && /^(?:\d+%|—)$/.test(e.image.drawn[0].text));
      const drawn = rings.flatMap(e => e.image.drawn);
      assert.deepEqual(drawn.slice(0,3).map(d=>d.text), [used === null ? '—' : (100-used)+'%', '67%', '44%']);
      for (const image of rings) for (const d of image.image.drawn) {
        assert(d.rect.x >= 2 && d.rect.x + d.rect.width <= image.imageSize.width - 2);
        assert(d.rect.y >= 0 && d.rect.y + d.rect.height <= image.imageSize.height);
        assert(d.rect.width >= d.font * (d.text.length === 4 ? 2.5 : 2));
      }
      assert(!elements.some(e=>e.date)); // Absolute reading times cannot look like a running reset timer.
      assert(!widgetText(widget).includes('Обновлено'));
      assert.equal(elements.filter(e=>e.text === '●').length, 1);
    }
  }
  delete global.Device.screenSize;
});

test('quota captions use consistent rows, Almaty time and the retained window own timestamp', () => {
  const p = sample(NOW).providers[0], w = p.limits[1];
  assert.deepEqual(U.quotaCaptionLines(w,p,NOW,'Asia/Almaty'), ['Сброс', '10 сент., 15:00']);
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


test('large-widget typography stays identical between providers without automatic shrinking', () => {
  const s = require('./fixture.js').completeSample(NOW);
  const flatten = e => [e, ...e.children.flatMap(flatten)];
  for (const width of [375, 390, 440]) {
    global.Device.screenSize = () => ({width});
    const widget = U.createWidget(s, U.parseOptions('codex'), 'large', {}, NOW);
    const elements = flatten(widget), labels = elements.filter(e => typeof e.text === 'string');
    assert(labels.every(e => e.minimumScaleFactor === 1));
    for (const name of ['Claude Code', 'Codex']) {
      const heading = labels.find(e => e.text === name);
      assert.equal(heading.font, 13);
      const row = elements.find(e => e.children.includes(heading));
      assert.equal(row.size.height, 18);
    }
    for (const label of ['Сегодня', 'Промпты', 'Сессии', 'Токены сегодня', '7 дней', '30 дней']) {
      const drawn = elements.flatMap(e => e.image?.drawn || []);
      const matches = drawn.filter(e => e.text === label || (['Промпты','Сессии'].includes(label) && e.text.startsWith(label + ' ')));
      assert.equal(matches.length, 2);
      assert(matches.every(e => e.font === 9.5));
    }
  }
  delete global.Device.screenSize;
});


test('reset captions have explicit top and bottom margins and share centered statistic columns', () => {
  const s = require('./fixture.js').completeSample(NOW);
  const flatten = e => [e, ...e.children.flatMap(flatten)];
  const widget = U.createWidget(s, U.parseOptions('codex'), 'large', {}, NOW);
  const images = flatten(widget).filter(e => e.image);
  const captions = images.filter(e => e.image.drawn.length === 2 && e.image.drawn[0].text === 'Сброс');
  assert.equal(captions.length, 5);
  for (const image of captions) {
    assert.equal(image.imageSize.height, 30);
    for (const line of image.image.drawn) {
      assert(line.rect.y >= 2);
      assert(line.rect.y + line.rect.height <= image.imageSize.height - 1);
      assert(line.rect.height >= line.font * 1.3);
    }
  }
  const stats = images.filter(e => e.image.drawn.some(d => d.text === 'Токены сегодня'));
  assert.equal(stats.length, 2);
  for (const image of stats) {
    assert.equal(image.imageSize.height, 48);
    const rows = image.image.drawn;
    for (let i=0; i<3; i++) {
      assert.equal(rows[i*2].rect.x, rows[i*2+1].rect.x);
      assert.equal(rows[i*2].rect.x, rows[6+i].rect.x);
    }
    for (const line of rows) assert(line.rect.y >= 1 && line.rect.y + line.rect.height <= 47);
  }
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

test('English widgets translate all sizes and keep language in detail links', () => {
  const snapshot=require('./fixture.js').completeSample(NOW);
  snapshot.language='en';
  for (const family of ['small','medium','large','accessoryCircular','accessoryInline','accessoryRectangular']) {
    const widget=U.createWidget(snapshot,U.parseOptions('claude'),family,{},NOW);
    const content=widgetText(widget);
    assert(!/[А-Яа-яЁё]/.test(content), family+': '+content);
    assert(widget.url.includes('&lang=en'));
    if (family==='large') {
      for (const label of ['AI Usage','Remaining','Weekly','Tokens today','Prompts','Sessions','Resets','This Mac']) assert(content.includes(label),label);
    }
  }
  const legacy={...snapshot};delete legacy.language;
  assert(widgetText(U.createWidget(legacy,U.parseOptions('codex'),'large',{},NOW)).includes('Лимиты и токены'));
  assert(widgetText(U.createWidget(legacy,U.parseOptions('codex;lang=en'),'large',{},NOW)).includes('AI Usage'));
  assert(widgetText(U.createWidget(snapshot,U.parseOptions('codex;lang=ru'),'large',{},NOW)).includes('Лимиты и токены'));
  assert.equal(U.parseOptions('lang=bad').language,null);
  assert.throws(()=>U.validateSnapshot({...snapshot,language:'bad'}),/invalid_language/);
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
