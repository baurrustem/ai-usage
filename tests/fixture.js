// Synthetic data, never copied from a real subscription.
function sample(now = Date.now()) {
  const at = ms => new Date(ms).toISOString();
  const make = (id, name, used, weekly) => {
    const reset = at(now + 110 * 60000);
    const windows = [{ id: id + ':primary', groupId: id, groupName: name, slot: 'primary', title: 'Сессия',
      windowMinutes: 300, usedPercent: used, resetsAt: reset, resetDescription: null },
    { id: id + ':secondary', groupId: id, groupName: name, slot: 'secondary', title: 'Неделя',
      windowMinutes: 10080, usedPercent: weekly, resetsAt: at(now + 3 * 86400000), resetDescription: null }];
    const state = { state: 'ok', fetchedAt: at(now - 120000), attemptedAt: at(now - 120000), source: id + '-cli', code: null, message: null };
    return { id, name, limits: windows, limitsState: state,
      display: id === 'claude' ? {hiddenLimitTerms:['sonnet'],pinnedLimits:[{id:'claude-weekly-scoped-fable',title:'Fable',windowMinutes:10080}]} : {hiddenLimitTerms:['spark','codex_bengalfox']},
      ...(id === 'codex' ? { resetCredits: { availableCount: 3, nextExpiresAt: at(now + 12 * 86400000) } } : {}),
      tokens: { coverage: 'local', state: { ...state, source: 'codexbar-cost' }, daily: Array.from({ length: 30 }, (_, i) => ({
        date: at(now - (29 - i) * 86400000).slice(0, 10), totalTokens: (id === 'claude' ? 32000 : 11000) + (i * (id === 'claude' ? 73319 : 12457)) % 310000,
        inputTokens: id === 'claude' ? 10000 : 6000, outputTokens: 1000, cacheReadTokens: 3000, cacheCreationTokens: 0 })) },
      activity: {coverage:'local',state:{...state,source:'local-session-logs'},daily:Array.from({length:30},(_,i)=>({date:at(now-(29-i)*86400000).slice(0,10),prompts:id === 'claude' ? 12 : 7,sessionIds:[id+'-demo-'+Math.floor(i/4)]}))},
      limitHistory: windows.map((w, index) => ({ id: w.id, points: Array.from({ length: 144 }, (_, i) => ({
        at: at(now - (144 - i) * 10 * 60000), usedPercent: index ? 12 + i * .28 : (i % 45) * 1.9,
        resetsAt: index ? w.resetsAt : at(now - 86400000 + (Math.floor(i / 45) + 1) * 450 * 60000), breakBefore: i === 0 || (!index && i % 45 === 0)
      })) })) };
  };
  return { schemaVersion: 1, language: 'ru', generatedAt: at(now - 120000), timeZone: 'Asia/Almaty', retentionDays: 90,
    staleAfterSeconds: 900, providers: [make('claude', 'Claude', 32, 58), make('codex', 'Codex', 16, 37)] };
}
module.exports = { sample };


function completeSample(now = Date.now()) {
  const data = sample(now);
  data.providers[0].limits.push({ ...data.providers[0].limits[1], id: 'claude-weekly-scoped-fable', slot: 'extra', title: 'Fable only', usedPercent: 21 });
  data.providers[1].limits.push({ ...data.providers[1].limits[0], id: 'spark:primary', groupId: 'spark', groupName: 'Codex Spark', usedPercent: 47 });
  return data;
}
module.exports.completeSample = completeSample;

// The public demo has neutral defaults: every returned limit is visible.
function publicSample(now = Date.now()) {
  const data = completeSample(now);
  data.language = 'en';
  for (const provider of data.providers) delete provider.display;
  return data;
}
module.exports.publicSample = publicSample;
