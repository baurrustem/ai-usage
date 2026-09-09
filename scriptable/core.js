/* AI Usage · local metrics only. Shared by Scriptable and the test suite. */
const AIUsage = (() => {
  const ENGLISH = {
  "нет данных": "no data",
  "Нет данных": "No data",
  "только что": "just now",
  " мин назад": "m ago",
  " ч назад": "h ago",
  " дн назад": "d ago",
  "Данные о сбросах недоступны": "Reset count unavailable",
  "Ожидается обновление": "Awaiting update",
  "Данные устарели": "Stale data",
  "Лимит": "Limit",
  "Неделя": "Weekly",
  " дн": "d",
  " часов": " hours",
  " час": " hour",
  " день с данными": " day with data",
  " мин": "m",
  "Нет данных о лимите": "No quota data",
  "Последние данные · ": "Last reading · ",
  "Время сброса недоступно": "Reset time unavailable",
  "Сброс через ": "Resets in ",
  " ч": "h",
  "Сброс · ": "Resets · ",
  " не получен": " not received",
  "График использования лимита в процентах": "Quota usage history in percent",
  "Обновлено: ": "Updated: ",
  "Нужен вход на Mac": "Sign in on Mac",
  "Лимиты загружаются": "Loading limits",
  "Лимиты недоступны": "Limits unavailable",
  " в подробностях": " more in details",
  "Устарело · ": "Stale · ",
  "Сбросы": "Resets",
  "Токены*": "Tokens*",
  "Токены": "Tokens",
  "сег.": "today",
  "7д": "7d",
  "30д": "30d",
  "Сегодня*": "Today*",
  "Сегодня": "Today",
  "Промпты": "Prompts",
  "Сессии": "Sessions",
  "Токены* сегодня": "Tokens* today",
  "Токены сегодня": "Tokens today",
  "7 дней": "7 days",
  "30 дней": "30 days",
  "Промпты ": "Prompts ",
  "Сессии ": "Sessions ",
  "Ожидается": "Awaiting",
  "обновление": "update",
  "Сброс": "Resets",
  "Время сброса": "Reset time",
  "Не получено": "Unavailable",
  "о лимите Fable": "for Fable",
  "о лимите": "for this limit",
  "Лимиты и токены": "AI Usage",
  "Осталось": "Remaining",
  "Ошибка источника": "Source error",
  "7 дн.": "7d",
  "*Устарело · ": "*Stale · ",
  "По данным этого Mac · Токены с кэшем": "This Mac · Tokens include cache",
  "Открой Scriptable для настройки": "Open Scriptable to set up",
  "обновить": "update",
  "устарело": "stale",
  "м назад": "m ago",
  " осталось": " left",
  "iCloud доставляет более старый снимок": "iCloud delivered an older snapshot",
  "Показаны последние сохранённые данные": "Showing the last saved data",
  "Снимок ещё не получен из iCloud": "Waiting for an iCloud snapshot",
  ": осталось ": ": remaining ",
  ". Открыть историю": ". Open history",
  "Один из сбросов истекает ": "A reset credit expires ",
  "* Часть лимитов не обновилась. Показаны последние полученные данные.": "* Some limits have not updated. Their last readings are shown.",
  "Лимиты пока недоступны": "Limits are not available yet",
  "Лимиты подписок": "Subscription limits",
  "Подключи Scriptable": "Set up Scriptable",
  "Включи iCloud Drive для Scriptable на iPhone.": "Enable iCloud Drive for Scriptable on your iPhone.",
  "Используй один Apple Account на Mac и iPhone.": "Use the same Apple Account on your Mac and iPhone.",
  "Запусти установщик AI Usage на Mac.": "Run the AI Usage installer on your Mac.",
  "Дождись синхронизации и открой скрипт повторно.": "Wait for sync, then open the script again.",
  "Данные ещё не получены.": "No data received yet.",
  "История появится после первых обновлений.": "History will appear after the first updates.",
  "Токены по дням": "Daily tokens",
  " токенов": " tokens",
  " дней": " days",
  " дн. с данными": " days with data",
  "Вход без кэша": "Uncached input",
  "Чтение кэша": "Cache reads",
  "Запись кэша": "Cache writes",
  "Ответы модели": "Model output",
  "Состав токенов · ": "Token breakdown · ",
  "сегодня": "today",
  "Общий счётчик включает чтение кэша. Доля кэшированного входа: ": "Totals include cache reads. Cached input share: ",
  "Промпты и сессии · этот Mac": "Prompts & sessions · this Mac",
  "Период": "Period",
  "Актив. дни": "Active days",
  "Промпты — пользовательские сообщения без служебных событий и заданий подагентов. Сессии — уникальные диалоги с промптами за период; продолжение диалога не создаёт новую сессию.": "Prompts are human messages, excluding system events and subagent tasks. Sessions are unique conversations with prompts in the period; continuing a conversation does not create another session.",
  "Обновлено ": "Updated ",
  " · данные недоступны или устарели": " · data unavailable or stale",
  "Лимиты": "Limits",
  "Получены": "Received",
  "Получена": "Received",
  "Недоступны": "Unavailable",
  "Недоступна": "Unavailable",
  "Токены Mac": "Mac tokens",
  "Активность Mac": "Mac activity",
  "Кэш": "Cache",
  "История и активность": "History & activity",
  "Сервис": "Service",
  "Окно лимита": "Quota window",
  "Использовано · 0–100%": "Used · 0–100%",
  "24 часа": "24 hours",
  "Разрывы: сброс лимита или нет наблюдений.": "Gaps indicate a reset or missing observations.",
  "Пропуски не означают нулевой расход.": "Missing data does not mean zero usage.",
  "Токены · по данным этого Mac": "Tokens · from this Mac",
  " · данные могут быть устаревшими": " · data may be stale",
  "Синхронизация": "Sync status",
  "Снимок Mac": "Mac snapshot",
  "Часовой пояс": "Time zone",
  "Mac собирает данные каждые 5 минут, пока не спит. Время доставки и обновления виджета зависит от iCloud и iOS.": "Your Mac collects data every 5 minutes while awake. iCloud and iOS control delivery and widget refresh.",
  "Основной": "Primary",
  "Дополнительный": "Additional",
  "Сессия": "Session",
  "Отдельный лимит": "Model limit",
  "Не найден инструмент на Mac": "Tool not found on Mac",
  "Сервис не ответил вовремя": "Source timed out",
  "Claude /usage пока не загрузил лимиты": "Claude /usage is still loading limits",
  "Требуется повторный вход на Mac": "Sign in again on Mac",
  "Сервис временно ограничил частоту запросов": "Source rate limit reached",
  "Не удалось прочитать формат ответа": "Could not read the source format",
  "Сервис не вернул числовые показатели": "No numeric readings returned",
  "Ошибка подключения на Mac": "Connection error on Mac",
  "Требуется CodexBar CLI 0.56.7": "CodexBar CLI 0.56.7 required",
  "Источник Claude CLI недоступен; проверь вход на Mac": "Claude CLI unavailable; check sign-in on Mac"
};
  const instances = {};
  function forLanguage(language) {
    const selected = language === "en" ? "en" : "ru";
    return instances[selected] || (instances[selected] = createLanguageAPI(selected));
  }
  function createLanguageAPI(language) {
    const locale = language === "en" ? "en-GB" : "ru-RU";
    function tr(message) {
      return language === "en" && Object.prototype.hasOwnProperty.call(ENGLISH, message) ? ENGLISH[message] : message;
    }
    function sourceMessage(state) {
      const messages = {
        missing_tool: "Не найден инструмент на Mac", timeout: "Сервис не ответил вовремя",
        loading: "Claude /usage пока не загрузил лимиты", auth: "Требуется повторный вход на Mac",
        rate_limited: "Сервис временно ограничил частоту запросов", invalid_data: "Не удалось прочитать формат ответа",
        unavailable: "Сервис не вернул числовые показатели", process_failed: "Ошибка подключения на Mac",
        unsupported_version: "Требуется CodexBar CLI 0.56.7", cli_unavailable: "Источник Claude CLI недоступен; проверь вход на Mac"
      };
      const message = messages[(state || {}).code];
      return tr(typeof message === "string" ? message : "Данные устарели");
    }

    const COLORS = { claude: "D08061", codex: "299E8C" };
    const RANGE_MS = { "24h": 86400000, "7d": 604800000, "30d": 2592000000 };
    const validDate = x => typeof x === "string" && Number.isFinite(Date.parse(x));
    const finite = x => typeof x === "number" && Number.isFinite(x);
    const clamp = x => finite(x) ? Math.max(0, Math.min(100, x)) : null;
    const esc = x => String(x == null ? "" : x).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    function validateSnapshot(data) {
      if (!data || data.schemaVersion !== 1 || !validDate(data.generatedAt) || !Array.isArray(data.providers)) throw new Error("invalid_snapshot");
      if (data.language != null && !["en", "ru"].includes(data.language)) throw new Error("invalid_language");
      if (data.providers.length < 1 || data.providers.length > 2 || new Set(data.providers.map(p => p.id)).size !== data.providers.length) throw new Error("invalid_providers");
      for (const p of data.providers) {
        if (!["claude", "codex"].includes(p.id) || !Array.isArray(p.limits) || !p.limitsState || !p.tokens || !p.tokens.state || !Array.isArray(p.tokens.daily) || !Array.isArray(p.limitHistory)) throw new Error("invalid_provider");
        if (p.resetCredits != null && (!Number.isSafeInteger(p.resetCredits.availableCount) || p.resetCredits.availableCount < 0 ||
          (p.resetCredits.nextExpiresAt != null && !validDate(p.resetCredits.nextExpiresAt)))) throw new Error("invalid_reset_credits");
        if (p.display != null) {
          const d = p.display;
          if (typeof d !== "object" || Array.isArray(d) ||
              (d.hiddenLimitTerms != null && (!Array.isArray(d.hiddenLimitTerms) || d.hiddenLimitTerms.some(x => typeof x !== "string" || !x.trim()))) ||
              (d.pinnedLimits != null && (!Array.isArray(d.pinnedLimits) || d.pinnedLimits.some(x => !x || typeof x.id !== "string" || !x.id || typeof x.title !== "string" || !x.title ||
                (x.windowMinutes != null && (!Number.isSafeInteger(x.windowMinutes) || x.windowMinutes <= 0)))))) throw new Error("invalid_display");
        }
        for (const w of p.limits) {
          if (!w || typeof w.id !== "string" || (w.usedPercent !== null && (!finite(w.usedPercent) || w.usedPercent < 0 || w.usedPercent > 100))) throw new Error("invalid_limit");
        }
        for (const row of p.tokens.daily) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !finite(row.totalTokens) || row.totalTokens < 0) throw new Error("invalid_tokens");
        }
        if (p.activity != null) {
          if (!p.activity.state || !Array.isArray(p.activity.daily)) throw new Error("invalid_activity");
          for (const row of p.activity.daily) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isSafeInteger(row.prompts) || row.prompts < 0 ||
                !Array.isArray(row.sessionIds) || row.sessionIds.some(id => typeof id !== "string")) throw new Error("invalid_activity");
          }
        }
        for (const series of p.limitHistory) {
          if (!series || typeof series.id !== "string" || !Array.isArray(series.points)) throw new Error("invalid_history");
          for (const point of series.points) {
            if (!validDate(point.at) || !finite(point.usedPercent) || point.usedPercent < 0 || point.usedPercent > 100) throw new Error("invalid_history");
          }
        }
      }
      try { new Intl.DateTimeFormat("en", { timeZone: data.timeZone }).format(); } catch (_) { throw new Error("invalid_timezone"); }
      return data;
    }

    function parseOptions(parameter) {
      const options = { provider: "codex", metric: "limits", range: "24h", group: null, limit: null, language: null };
      if (typeof parameter !== "string") return options;
      for (const pair of parameter.split(";")) {
        const parts = pair.trim().split("=");
        if (parts.length === 1 && ["claude", "codex"].includes(parts[0])) options.provider = parts[0];
        if (parts[0] === "provider" && ["claude", "codex"].includes(parts[1])) options.provider = parts[1];
        if (parts[0] === "metric" && ["limits", "tokens"].includes(parts[1])) options.metric = parts[1];
        if (parts[0] === "range" && RANGE_MS[parts[1]]) options.range = parts[1];
        if (parts[0] === "lang" && ["en", "ru"].includes(parts[1])) options.language = parts[1];
        if (["group", "limit"].includes(parts[0]) && parts[1]) options[parts[0]] = parts.slice(1).join("=");
      }
      return options;
    }

    function ageText(at, now = Date.now()) {
      if (!validDate(at)) return tr("нет данных");
      const minutes = Math.max(0, Math.floor((now - Date.parse(at)) / 60000));
      if (minutes < 1) return tr("только что");
      if (minutes < 60) return minutes + tr(" мин назад");
      if (minutes < 1440) return Math.floor(minutes / 60) + tr(" ч назад");
      return Math.floor(minutes / 1440) + tr(" дн назад");
    }

    function stale(state, now = Date.now()) {
      return !state || state.state !== "ok" || !validDate(state.fetchedAt) || now - Date.parse(state.fetchedAt) > 900000 || Date.parse(state.fetchedAt) > now + 60000;
    }

    function resetDue(window, state, now = Date.now()) {
      state = limitState(window, state);
      return !!window && validDate(window.resetsAt) && Date.parse(window.resetsAt) <= now &&
        (!state || !validDate(state.fetchedAt) || Date.parse(state.fetchedAt) < Date.parse(window.resetsAt));
    }

    function limitState(window, state) {
      return window && window.retained ? { ...state, state: "stale", fetchedAt: window.observedAt } : state;
    }

    function remaining(window, state, now = Date.now()) {
      return !window || resetDue(window, state, now) ? null : (clamp(window.usedPercent) === null ? null : 100 - clamp(window.usedPercent));
    }

    function pct(window, state, now = Date.now()) {
      const value = remaining(window, state, now);
      return value === null ? "—" : Math.round(value) + "%";
    }

    function resetCreditInfo(provider, now = Date.now()) {
      const credits = provider.resetCredits, state = provider.limitsState;
      if (!credits || !Number.isSafeInteger(credits.availableCount) || credits.availableCount < 0)
        return { value: "—", outdated: false, note: tr("Данные о сбросах недоступны") };
      const expired = credits.availableCount > 0 && validDate(credits.nextExpiresAt) && Date.parse(credits.nextExpiresAt) <= now &&
        (!validDate(state.fetchedAt) || Date.parse(state.fetchedAt) < Date.parse(credits.nextExpiresAt));
      if (expired) return { value: "—", outdated: true, note: tr("Ожидается обновление") };
      return { value: String(credits.availableCount), outdated: stale(state, now), note: stale(state, now) ? tr("Данные устарели") : "" };
    }

    function windowLabel(window) {
      if (!window) return tr("Лимит");
      const mins = window.windowMinutes;
      if (mins === 10080) return tr("Неделя");
      if (finite(mins) && mins > 0) return mins >= 1440 && mins % 1440 === 0 ? mins / 1440 + tr(" дн") :
        (mins % 60 === 0 ? mins / 60 + tr(mins === 60 ? " час" : " часов") : mins + tr(" мин"));
      return tr(window.title) || tr("Лимит");
    }

    function resetText(window, state, now = Date.now()) {
      if (!window) return tr("Нет данных о лимите");
      if (resetDue(window, state, now)) return tr("Ожидается обновление");
      if (window.retained) return tr("Последние данные · ") + ageText(window.observedAt, now);
      if (!validDate(window.resetsAt)) return language === "ru" && window.resetDescription ? window.resetDescription : tr("Время сброса недоступно");
      const minutes = Math.max(0, Math.ceil((Date.parse(window.resetsAt) - now) / 60000));
      if (minutes >= 1440) return tr("Сброс через ") + Math.floor(minutes / 1440) + (tr(" дн") + " ") + Math.floor(minutes % 1440 / 60) + tr(" ч");
      return tr("Сброс через ") + (minutes >= 60 ? Math.floor(minutes / 60) + (tr(" ч") + " ") : "") + minutes % 60 + tr(" мин");
    }

    function widgetResetText(window, state, now = Date.now(), timeZone = "UTC") {
      if (!window || window.retained || !validDate(window.resetsAt) || resetDue(window, state, now)) return resetText(window, state, now);
      const date = new Date(window.resetsAt);
      const sameDay = dayKey(now, timeZone) === dayKey(date.getTime(), timeZone);
      const format = sameDay ? { hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
      return tr("Сброс · ") + new Intl.DateTimeFormat(locale, { timeZone, ...format }).format(date);
    }

    function displayLimits(provider) {
      const tag = w => [w.id, w.groupId, w.groupName, w.title].join(" ").toLowerCase();
      const preferences = provider.display || {};
      const hidden = preferences.hiddenLimitTerms || [];
      const visible = w => !hidden.some(term => tag(w).includes(term.toLowerCase()));
      const pins = preferences.pinnedLimits || [];
      let windows = provider.limits.map(w => {
        const pin = pins.find(pin => pin.id === w.id);
        return pin ? { ...w, title: pin.title } : w;
      });
      for (const pin of pins) {
        if (windows.some(w => w.id === pin.id)) continue;
        // Only the exact configured ID can supply a retained reading. No inferred percentages.
        const series = (provider.limitHistory || []).find(s => s.id === pin.id);
        const last = (series ? series.points : []).filter(p => validDate(p.at) && finite(p.usedPercent))
          .reduce((latest, p) => !latest || Date.parse(p.at) > Date.parse(latest.at) ? p : latest, null);
        windows.push({ id: pin.id, groupId: provider.id, groupName: provider.name,
          slot: "extra", title: pin.title, windowMinutes: pin.windowMinutes || null, usedPercent: null,
          resetsAt: null, resetDescription: null,
          ...(last ? { usedPercent: last.usedPercent, resetsAt: last.resetsAt, observedAt: last.at, retained: true } : {}) });
      }
      windows = windows.filter(visible);
      return windows;
    }

    function displaySnapshot(snapshot) {
      if (!snapshot) return snapshot;
      return { ...snapshot, providers: snapshot.providers.map(provider => {
        const limits = displayLimits(provider), ids = new Set(limits.map(w => w.id));
        return { ...provider, limits, limitHistory: provider.limitHistory.filter(series => ids.has(series.id)) };
      }) };
    }

    function selectedLimits(provider, options) {
      const windows = displayLimits(provider);
      if (options.limit) return windows.filter(w => w.id === options.limit);
      const group = options.group || (windows.find(w => w.groupId === provider.id) || windows[0] || {}).groupId;
      return windows.filter(w => w.groupId === group).sort((a, b) =>
        (["primary", "secondary", "tertiary", "extra"].indexOf(a.slot) - ["primary", "secondary", "tertiary", "extra"].indexOf(b.slot)));
    }

    function dayKey(now, timeZone) {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(now));
      const get = name => parts.find(p => p.type === name).value;
      return get("year") + "-" + get("month") + "-" + get("day");
    }

    function tokenTotal(provider, days, now, timeZone) {
      const today = dayKey(now, timeZone);
      const begin = new Date(Date.parse(today + "T12:00:00Z") - (days - 1) * 86400000).toISOString().slice(0, 10);
      const rows = provider.tokens.daily.filter(d => d.date >= begin && d.date <= today);
      return { value: rows.length ? rows.reduce((sum, d) => sum + d.totalTokens, 0) : null, days: rows.length };
    }

    function activityTotal(provider, days, now, timeZone) {
      const today = dayKey(now, timeZone);
      const begin = new Date(Date.parse(today + "T12:00:00Z") - (days - 1) * 86400000).toISOString().slice(0, 10);
      const rows = ((provider.activity || {}).daily || []).filter(d => d.date >= begin && d.date <= today);
      if (!rows.length) return { prompts: null, sessions: null, activeDays: null };
      return { prompts: rows.reduce((n, d) => n + d.prompts, 0), sessions: new Set(rows.flatMap(d => d.sessionIds)).size,
        activeDays: rows.filter(d => d.prompts > 0).length };
    }

    function tokenBreakdown(provider, days, now, timeZone) {
      const today = dayKey(now, timeZone);
      const begin = new Date(Date.parse(today + "T12:00:00Z") - (days - 1) * 86400000).toISOString().slice(0, 10);
      const rows = provider.tokens.daily.filter(d => d.date >= begin && d.date <= today);
      const sum = key => rows.length && rows.every(d => finite(d[key])) ? rows.reduce((n, d) => n + d[key], 0) : null;
      const input = sum("inputTokens"), read = sum("cacheReadTokens"), write = sum("cacheCreationTokens"), output = sum("outputTokens");
      // Codex includes cache reads in inputTokens; Claude reports them separately.
      const uncached = provider.id === "codex" ? (input !== null && read !== null ? Math.max(0, input - read) : null) : input;
      const allInput = provider.id === "codex" ? input : (input !== null && read !== null && write !== null ? input + read + write : null);
      return { input: uncached, cacheRead: read, cacheWrite: provider.id === "codex" ? null : write, output,
        cachePercent: allInput > 0 && read !== null ? 100 * read / allInput : null };
    }

    function compactNumber(value) {
      if (!finite(value)) return "—";
      if (value >= 1e9) return (value / 1e9).toFixed(1).replace(".0", "") + "B";
      if (value >= 1e6) return (value / 1e6).toFixed(1).replace(".0", "") + "M";
      if (value >= 1e3) return (value / 1e3).toFixed(1).replace(".0", "") + "K";
      return Math.round(value).toString();
    }

    function historySegments(provider, limitId, range, now = Date.now()) {
      const series = provider.limitHistory.find(s => s.id === limitId);
      if (!series) return [];
      const cutoff = now - RANGE_MS[range];
      const segments = [];
      let segment = [];
      for (const point of series.points.filter(p => Date.parse(p.at) >= cutoff && Date.parse(p.at) <= now)) {
        if (point.breakBefore && segment.length) { segments.push(segment); segment = []; }
        segment.push(point);
      }
      if (segment.length) segments.push(segment);
      return segments;
    }

    function chartSVG(provider, limitId, range, now) {
      const width = 600, height = 170, pad = 12, start = now - RANGE_MS[range];
      const pointXY = p => [pad + (Date.parse(p.at) - start) / RANGE_MS[range] * (width - pad * 2), pad + (100 - p.usedPercent) / 100 * (height - pad * 2)];
      const lines = historySegments(provider, limitId, range, now).map(segment => {
        const points = segment.map(pointXY);
        const line = points.map(p => p.map(x => x.toFixed(2)).join(",")).join(" ");
        const tail = points[points.length - 1];
        return '<polyline points="' + line + '" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<circle cx="' + tail[0] + '" cy="' + tail[1] + '" r="3" fill="currentColor"/>';
      }).join("");
      return ("<svg viewBox=\"0 0 600 170\" role=\"img\" aria-label=\"" + tr("График использования лимита в процентах") + "\">") +
        [0, 50, 100].map(v => '<line x1="12" x2="588" y1="' + (pad + (100 - v) / 100 * (height - pad * 2)) + '" y2="' + (pad + (100 - v) / 100 * (height - pad * 2)) + '" stroke="currentColor" opacity=".1"/>').join("") + lines + '</svg>';
    }

    function palette() {
      const dark = Device.isUsingDarkAppearance();
      return { background: new Color(dark ? "171717" : "FFFFFF"), text: new Color(dark ? "F2F2F2" : "202020"),
        muted: new Color(dark ? "B8B8B8" : "5F5F5F"), track: new Color(dark ? "303030" : "EBEBEB"),
        claude: new Color(dark ? "E1A183" : "AE593D"), codex: new Color(dark ? "6AD2BC" : "197D6B") };
    }

    function text(parent, value, size, color, weight = "regular") {
      const element = parent.addText(String(value));
      element.font = weight === "bold" ? Font.boldSystemFont(size) : weight === "semibold" ? Font.semiboldSystemFont(size) :
        weight === "medium" ? Font.mediumSystemFont(size) : Font.systemFont(size);
      if (color) element.textColor = color;
      element.lineLimit = 1;
      element.minimumScaleFactor = 0.7;
      return element;
    }

    function freshness(parent, at, color, size = 8, now = Date.now()) {
      return text(parent, validDate(at) ? tr("Обновлено: ") + ageText(at, now) : tr("Нет данных"), size, color);
    }

    function bar(parent, value, width, color, track) {
      const ctx = new DrawContext();
      ctx.size = new Size(width, 3); ctx.opaque = false; ctx.respectScreenScale = true;
      ctx.setFillColor(track); ctx.fillRect(new Rect(0, 0, width, 3));
      if (value !== null && value > 0) { ctx.setFillColor(color); ctx.fillRect(new Rect(0, 0, width * value / 100, 3)); }
      const image = parent.addImage(ctx.getImage()); image.imageSize = new Size(width, 3);
    }

    function ringImage(value, label, caption, color) {
      const ctx = new DrawContext(); ctx.size = new Size(68, 68); ctx.opaque = false; ctx.respectScreenScale = true;
      const arc = (fraction, opacity) => {
        const path = new Path();
        for (let i = 0; i <= Math.max(1, Math.round(fraction * 100)); i++) {
          const angle = -Math.PI / 2 + (Math.PI * 2 * Math.min(i / 100, fraction));
          const p = new Point(34 + 30 * Math.cos(angle), 34 + 30 * Math.sin(angle));
          if (i === 0) path.move(p); else path.addLine(p);
        }
        ctx.addPath(path); ctx.setStrokeColor(new Color(color, opacity)); ctx.setLineWidth(3); ctx.strokePath();
      };
      arc(1, 0.22); if (value !== null && value > 0) arc(value / 100, 1);
      ctx.setTextColor(new Color(color)); ctx.setTextAlignedCenter();
      ctx.setFont(Font.mediumSystemFont(9)); ctx.drawTextInRect(label, new Rect(8, 9, 52, 12));
      ctx.setFont(Font.boldSystemFont(22)); ctx.drawTextInRect(value === null ? "—" : String(Math.round(value)), new Rect(6, 23, 56, 26));
      ctx.setFont(Font.systemFont(8)); ctx.drawTextInRect(caption, new Rect(7, 49, 54, 10));
      return ctx.getImage();
    }

    function sparkline(parent, provider, options, width, color, now, timeZone) {
      const height = 58, ctx = new DrawContext(); ctx.size = new Size(width, height); ctx.opaque = false; ctx.respectScreenScale = true;
      ctx.setStrokeColor(color); ctx.setLineWidth(1.8);
      if (options.metric === "tokens") {
        const days = options.range === "30d" ? 30 : 7;
        const today = dayKey(now, timeZone);
        const start = Date.parse(today + "T12:00:00Z") - (days - 1) * 86400000;
        const data = provider.tokens.daily.filter(d => d.date <= today && Date.parse(d.date + "T12:00:00Z") >= start);
        const max = Math.max(1, ...data.map(x => x.totalTokens));
        for (const row of data) {
          const index = Math.round((Date.parse(row.date + "T12:00:00Z") - start) / 86400000);
          const barHeight = row.totalTokens / max * (height - 4);
          ctx.setFillColor(color); ctx.fillRect(new Rect(index * width / days + 1, height - barHeight, Math.max(1, width / days - 3), Math.max(1, barHeight)));
        }
      } else {
        const window = selectedLimits(provider, options)[0];
        const start = now - RANGE_MS[options.range];
        for (const segment of historySegments(provider, window && window.id, options.range, now)) {
          const path = new Path(); let last;
          segment.forEach((p, i) => {
            last = new Point(3 + (Date.parse(p.at) - start) / RANGE_MS[options.range] * (width - 6), 3 + (100 - p.usedPercent) / 100 * (height - 6));
            if (i === 0) path.move(last); else path.addLine(last);
          });
          ctx.addPath(path); ctx.strokePath();
          if (last) { ctx.setFillColor(color); ctx.fillEllipse(new Rect(last.x - 2, last.y - 2, 4, 4)); }
        }
      }
      const image = parent.addImage(ctx.getImage()); image.imageSize = new Size(width, height);
    }

    function providerName(provider) {
      return provider.id === "claude" ? "Claude Code" : provider.name;
    }

    function limitLabel(window, provider) {
      const parts = [];
      if (window.groupId !== provider.id) parts.push(window.groupName || window.groupId);
      if (["extra", "tertiary"].includes(window.slot) && window.title && window.title !== windowLabel(window)) parts.push(tr(window.title));
      parts.push(windowLabel(window));
      return parts.join(" · ") + (window.retained ? " *" : "");
    }

    function nativeLimitLabel(window, provider) {
      // Keep the model version when shortening long provider-supplied group names.
      return limitLabel(window, provider).replace(/GPT-([0-9.]+)-Codex-Spark/gi, "Spark $1")
        .replace(/Codex Spark/gi, "Spark").replace(/\s+only(?=\s*·)/gi, "");
    }

    function sourceCaption(state) {
      if (state.code === "auth" || state.code === "cli_unavailable") return tr("Нужен вход на Mac");
      if (state.code === "loading") return tr("Лимиты загружаются");
      return tr("Лимиты недоступны");
    }

    function providerCard(parent, provider, colors, width, now, maximum, timeZone, windows = provider.limits) {
      const color = colors[provider.id], state = provider.limitsState;
      if (provider.id === "codex") maximum = Math.min(maximum, 2);
      parent.size = new Size(width, 0);
      text(parent, providerName(provider), 13, colors.text, "bold"); parent.addSpacer(5);
      for (const window of windows.slice(0, maximum)) {
        const row = parent.addStack(); row.centerAlignContent();
        const label = row.addStack(); label.layoutVertically(); label.size = new Size(width - 49, 0);
        text(label, nativeLimitLabel(window, provider), 11, colors.text).minimumScaleFactor = 0.9;
        row.addSpacer();
        const value = text(row, pct(window, state, now), 18, color, "bold"); value.minimumScaleFactor = 1;
        parent.addSpacer(1);
        text(parent, widgetResetText(window, state, now, timeZone).replace(tr("Сброс · "), "↻ "), 9, colors.muted);
        parent.addSpacer(3);
      }
      if (!windows.length) {
        const label = text(parent, sourceCaption(state), 12, colors.muted); label.lineLimit = 2;
        parent.addSpacer(4);
      }
      resetCreditRow(parent, provider, colors, now, true);
      if (windows.length > maximum) text(parent, "+" + (windows.length - maximum) + tr(" в подробностях"), 10, colors.muted);
      else if (stale(state, now)) text(parent, tr("Устарело · ") + ageText(state.fetchedAt, now), 9, colors.muted);
      else freshness(parent, state.fetchedAt, colors.muted, 9, now);
    }

    function resetCreditRow(parent, provider, colors, now, compact = false) {
      if (provider.id !== "codex") return;
      const info = resetCreditInfo(provider, now);
      const row = parent.addStack(); row.centerAlignContent();
      fixedText(row, tr("Сбросы") + (info.outdated ? "*" : ""), compact ? 11 : 13, colors.muted);
      row.addSpacer();
      const value = text(row, info.value, compact ? 16 : 20, colors[provider.id], "bold"); value.minimumScaleFactor = 1;
      parent.addSpacer(3);
    }

    function tokenStrip(parent, provider, colors, now, timeZone) {
      const row = parent.addStack(); row.centerAlignContent();
      text(row, stale(provider.tokens.state, now) ? tr("Токены*") : tr("Токены"), 10, colors.muted);
      for (const [days, label] of [[1, tr("сег.")], [7, tr("7д")], [30, tr("30д")]]) {
        row.addSpacer();
        const cell = row.addStack(); cell.centerAlignContent();
        text(cell, label, 10, colors.muted); cell.addSpacer(4);
        const total = tokenTotal(provider, days, now, timeZone);
        const value = text(cell, compactNumber(total.value), 12, colors[provider.id], "bold");
        value.minimumScaleFactor = 1;
      }
    }

    // Fixed typography on the large widget: WidgetKit must not shrink one provider's
    // heading or activity labels while leaving the other provider at the requested size.
    const TYPE = { title: 15, provider: 13, quota: 10.5, caption: 9.5, metric: 15, activity: 11, credits: 20, footnote: 8 };
    function fixedText(parent, value, size, color, weight = "regular") {
      const label = text(parent, value, size, color, weight);
      label.minimumScaleFactor = 1;
      return label;
    }

    // Explicit trailing spacers pin native text to the leading edge of each fixed-width cell.
    function leadingText(parent, value, size, color, weight = "regular") {
      const row = parent.addStack(); row.setPadding(0, 0, 0, 0);
      const label = fixedText(row, value, size, color, weight);
      row.addSpacer();
      return label;
    }

    function activityStrip(parent, provider, colors, now, timeZone, width, tight = false) {
      parent.addSpacer(tight ? 2 : 4);
      const total = activityTotal(provider, 1, now, timeZone);
      const row = parent.addStack(); row.size = new Size(width, 15);
      const columns = [[null, stale((provider.activity || {}).state, now) ? tr("Сегодня*") : tr("Сегодня")], ["prompts", tr("Промпты")], ["sessions", tr("Сессии")]];
      columns.forEach(([key, label], index) => {
        if (index) row.addSpacer(8);
        const cell = row.addStack(); cell.size = new Size((width - 16) / 3, 15); cell.centerAlignContent();
        fixedText(cell, label, TYPE.caption, colors.muted);
        if (key) { cell.addSpacer(4); fixedText(cell, compactNumber(total[key]), TYPE.activity, colors[provider.id], "semibold"); }
        cell.addSpacer();
      });
    }

    function canvasText(ctx, value, rect, size, color, weight = "medium") {
      ctx.setTextColor(color); ctx.setTextAlignedCenter();
      ctx.setFont(weight === "bold" ? Font.boldSystemFont(size) : weight === "semibold" ? Font.semiboldSystemFont(size) : Font.mediumSystemFont(size));
      ctx.drawTextInRect(String(value), rect);
    }

    function canvasImage(parent, ctx, width, height) {
      const image = parent.addImage(ctx.getImage()); image.imageSize = new Size(width, height);
      image.applyFittingContentMode(); image.centerAlignImage();
      return image;
    }

    function centeredLabel(parent, value, width, size, color, weight = "semibold", height = 16) {
      const ctx = new DrawContext(); ctx.size = new Size(width, height); ctx.opaque = false; ctx.respectScreenScale = true;
      const lines = Array.isArray(value) ? value : [value];
      const lineHeight = (height - 2) / lines.length;
      lines.forEach((line, i) => canvasText(ctx, line, new Rect(2, 1 + i * lineHeight, width - 4, lineHeight), size, color, weight));
      return canvasImage(parent, ctx, width, height);
    }

    function statisticsBlock(parent, provider, colors, width, now, timeZone) {
      // One fixed canvas keeps the three columns centered and protects small text from
      // WidgetKit compressing individual rows vertically or distributing their spacers.
      const height = 48, ctx = new DrawContext(); ctx.size = new Size(width, height); ctx.opaque = false; ctx.respectScreenScale = true;
      const gap = 8, cell = (width - 2 * gap) / 3;
      const activity = activityTotal(provider, 1, now, timeZone);
      const labels = [stale(provider.tokens.state, now) ? tr("Токены* сегодня") : tr("Токены сегодня"), tr("7 дней"), tr("30 дней")];
      const activityLabels = [stale((provider.activity || {}).state, now) ? tr("Сегодня*") : tr("Сегодня"),
        tr("Промпты ") + compactNumber(activity.prompts), tr("Сессии ") + compactNumber(activity.sessions)];
      [1, 7, 30].forEach((days, i) => {
        const x = i * (cell + gap) + 2, w = cell - 4;
        canvasText(ctx, labels[i], new Rect(x, 1, w, 13), TYPE.caption, colors.muted);
        canvasText(ctx, compactNumber(tokenTotal(provider, days, now, timeZone).value), new Rect(x, 14, w, 20), TYPE.metric, colors.text, "bold");
      });
      activityLabels.forEach((label, i) => {
        canvasText(ctx, label, new Rect(i * (cell + gap) + 2, 34, cell - 4, 13), TYPE.caption, i ? colors[provider.id] : colors.muted, i ? "semibold" : "medium");
      });
      canvasImage(parent, ctx, width, height);
    }

    function quotaRing(parent, window, provider, colors, now, size, containerWidth = size) {
      const value = remaining(window, provider.limitsState, now);
      const ctx = new DrawContext(); ctx.size = new Size(size, size);
      ctx.opaque = false; ctx.respectScreenScale = true;
      const stroke = 2.5, center = size / 2, radius = center - stroke;
      const arc = (fraction, color) => {
        const path = new Path(), steps = Math.max(1, Math.ceil(fraction * 120));
        for (let i = 0; i <= steps; i++) {
          const angle = -Math.PI / 2 + 2 * Math.PI * fraction * i / steps;
          const point = new Point(center + radius * Math.cos(angle), center + radius * Math.sin(angle));
          if (i === 0) path.move(point); else path.addLine(point);
        }
        ctx.addPath(path); ctx.setStrokeColor(color); ctx.setLineWidth(stroke); ctx.strokePath();
      };
      arc(1, colors.track);
      if (value !== null && value > 0) arc(value / 100, colors[provider.id]);
      // Drawing the value in the same canvas prevents WidgetKit's HStack compression from
      // ellipsizing it (observed as "67…" and "4…" on the actual iPhone).
      const label = pct(window, provider.limitsState, now);
      const fontSize = label.length > 3 ? (size >= 52 ? 17 : size >= 46 ? 15 : 13.5) : (size >= 50 ? 18 : size >= 44 ? 17 : 16);
      const lineHeight = Math.ceil(fontSize * 1.25);
      ctx.setTextColor(colors.text); ctx.setTextAlignedCenter(); ctx.setFont(Font.boldSystemFont(fontSize));
      ctx.drawTextInRect(label, new Rect(2, (size - lineHeight) / 2, size - 4, lineHeight));
      const row = parent.addStack(); row.size = new Size(containerWidth, size); row.setPadding(0, 0, 0, 0);
      row.addSpacer(); canvasImage(row, ctx, size, size); row.addSpacer();
    }

    function tokenColumns(parent, provider, colors, width, now, timeZone) {
      const row = parent.addStack();
      const labels = [[1, stale(provider.tokens.state, now) ? tr("Токены* сегодня") : tr("Токены сегодня")], [7, tr("7 дней")], [30, tr("30 дней")]];
      labels.forEach(([days, label], index) => {
        if (index) row.addSpacer(8);
        const cell = row.addStack(); cell.layoutVertically(); cell.size = new Size((width - 16) / 3, 0);
        leadingText(cell, label, TYPE.caption, colors.muted);
        cell.addSpacer(1);
        leadingText(cell, compactNumber(tokenTotal(provider, days, now, timeZone).value), TYPE.metric, colors.text, "medium");
      });
    }

    function readingTime(at, now, timeZone) {
      if (!validDate(at)) return tr("нет данных");
      const sameDay = dayKey(Date.parse(at), timeZone) === dayKey(now, timeZone);
      const options = sameDay ? { hour: "2-digit", minute: "2-digit" } :
        { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
      return new Intl.DateTimeFormat(locale, { timeZone, ...options }).format(new Date(at));
    }

    function quotaCaptionLines(window, provider, now, timeZone) {
      if (resetDue(window, provider.limitsState, now)) return [tr("Ожидается"), tr("обновление")];
      if (window.retained) return [tr("Данные устарели"), readingTime(window.observedAt, now, timeZone)];
      if (validDate(window.resetsAt)) return [tr("Сброс"), readingTime(window.resetsAt, now, timeZone)];
      if (finite(window.usedPercent)) return [tr("Время сброса"), tr("Не получено")];
      return [tr("Нет данных"), window.title === "Fable" ? tr("о лимите Fable") : tr("о лимите")];
    }

    function quotaCaption(parent, window, provider, colors, now, timeZone, width) {
      // The previous 24 pt VStack cut the tops of glyphs on the phone. Render both
      // lines with explicit text rectangles and safe top/bottom margins in a 30 pt canvas.
      const height = 30, ctx = new DrawContext(); ctx.size = new Size(width, height); ctx.opaque = false; ctx.respectScreenScale = true;
      quotaCaptionLines(window, provider, now, timeZone).forEach((line, i) => {
        canvasText(ctx, line, new Rect(2, 2 + i * 14, width - 4, 13), TYPE.caption, colors.muted);
      });
      canvasImage(parent, ctx, width, height);
    }

    function widgetFreshness(snapshot, loadInfo = {}, now = Date.now()) {
      const states = snapshot.providers.flatMap(p => [p.limitsState, p.tokens.state, (p.activity || {}).state]);
      if (states.some(state => state && state.state === "error")) return "error";
      const incomplete = snapshot.providers.some(p => displayLimits(p).some(w =>
        w.retained || !finite(w.usedPercent) || !validDate(w.resetsAt) || resetDue(w, p.limitsState, now)) ||
        (p.id === "codex" && resetCreditInfo(p, now).value === "—"));
      if (loadInfo.cached || incomplete || states.some(state => stale(state, now)) ||
          stale({ state: "ok", fetchedAt: snapshot.generatedAt }, now)) return "stale";
      return "ok";
    }

    function largeWidget(parent, snapshot, colors, width, now, loadInfo) {
      const compact = width < 330;
      const top = parent.addStack(); top.size = new Size(width, 20); top.centerAlignContent();
      top.addSpacer(); fixedText(top, tr("Лимиты и токены"), TYPE.title, colors.text, "bold"); top.addSpacer(6);
      const status = widgetFreshness(snapshot, loadInfo, now);
      const statusColor = status === "ok" ? colors.codex : new Color(status === "error" ? "CB5148" : "BA8528");
      fixedText(top, "●", 8, statusColor).minimumScaleFactor = 1; top.addSpacer(10);
      fixedText(top, tr("Осталось"), TYPE.caption, colors.muted, "medium"); top.addSpacer();
      const counts = snapshot.providers.map(p => p.limits.length);
      const capacities = counts.map(n => Math.min(n, 2));
      // The native layout has three Claude columns and two Codex columns at most.
      let free = 5 - capacities.reduce((a, b) => a + b, 0);
      counts.forEach((n, i) => { const extra = Math.min(free, n - capacities[i], (snapshot.providers[i].id === "claude" ? 3 : 2) - capacities[i]); capacities[i] += extra; free -= extra; });
      const tight = compact && (width < 290 || counts.reduce((a, b) => a + b, 0) > 4);
      const gaugeSize = compact ? (tight ? 42 : 46) : 50;
      parent.addSpacer(tight ? 1 : compact ? 4 : 6);
      snapshot.providers.forEach((provider, index) => {
        const state = provider.limitsState, visible = provider.limits.slice(0, capacities[index]);
        const section = parent.addStack(); section.layoutVertically();
        section.url = "scriptable:///run?scriptName=AI%20Usage&provider=" + provider.id + "&lang=" + language;
        section.size = new Size(width, 0); section.setPadding(0, 0, 0, 0);
        const heading = section.addStack(); heading.size = new Size(width, 18); heading.centerAlignContent();
        heading.addSpacer(); fixedText(heading, providerName(provider), TYPE.provider, colors[provider.id], "bold");
        if (state.state === "error" && visible.length) { heading.addSpacer(6); fixedText(heading, tr("Ошибка источника"), 9, colors.muted); }
        heading.addSpacer();
        const inlineCredits = provider.id === "codex" && visible.length > 1;
        section.addSpacer(tight ? 1 : 3);
        if (provider.id === "claude" && visible.length) {
          const row = section.addStack(), gap = 8, cellWidth = (width - gap * (visible.length - 1)) / visible.length;
          visible.forEach((window, i) => {
            if (i) row.addSpacer(gap);
            const cell = row.addStack(); cell.layoutVertically(); cell.size = new Size(cellWidth, 0);
            centeredLabel(cell, nativeLimitLabel(window, provider), cellWidth, TYPE.quota, colors.text);
            cell.addSpacer(2);
            quotaRing(cell, window, provider, colors, now, gaugeSize, cellWidth);
            cell.addSpacer(2);
            quotaCaption(cell, window, provider, colors, now, snapshot.timeZone, cellWidth);
          });
        } else if (provider.id === "codex" && visible.length) {
          const row = section.addStack(); row.centerAlignContent();
          // Codex usually returns one account window. Keep reset credits distinct from quota percentages.
          visible.forEach((window, i) => {
            if (i) row.addSpacer(10);
            const cell = row.addStack(); cell.centerAlignContent();
            const columnWidth = (width - 16) / 3;
            const cellWidth = visible.length === 1 ? columnWidth * 2 + 8 : (width - 10) / 2;
            cell.size = new Size(cellWidth, 0);
            const ringSize = gaugeSize;
            const chartWidth = visible.length === 1 ? columnWidth : ringSize;
            quotaRing(cell, window, provider, colors, now, ringSize, chartWidth); cell.addSpacer(visible.length === 1 ? 8 : 5);
            const labelWidth = visible.length === 1 ? columnWidth : cellWidth - chartWidth - 5;
            const label = cell.addStack(); label.layoutVertically(); label.size = new Size(labelWidth, 0);
            const title = nativeLimitLabel(window, provider).replace(/^Codex\s+/, "");
            const compactTitle = labelWidth < 110 && title.includes(" · ") ? title.replace(tr("Неделя"), tr("7 дн.")) : title;
            centeredLabel(label, compactTitle, labelWidth, TYPE.quota, colors.text);
            label.addSpacer(2);
            quotaCaption(label, window, provider, colors, now, snapshot.timeZone, labelWidth);
          });
          if (visible.length === 1) {
            row.addSpacer(8);
            const creditsWidth = (width - 16) / 3;
            const credits = row.addStack(); credits.layoutVertically(); credits.size = new Size(creditsWidth, 0);
            const info = resetCreditInfo(provider, now);
            centeredLabel(credits, tr("Сбросы") + (info.outdated ? "*" : ""), creditsWidth, TYPE.caption, colors.muted);
            centeredLabel(credits, info.value, creditsWidth, TYPE.credits, colors[provider.id], "bold", 28);
          }
        } else {
          fixedText(section, sourceCaption(state), 12, colors.muted);
          resetCreditRow(section, provider, colors, now, false);
        }
        if (inlineCredits) {
          const info = resetCreditInfo(provider, now), row = section.addStack(); row.centerAlignContent();
          fixedText(row, tr("Сбросы") + (info.outdated ? "*" : ""), TYPE.caption, colors.muted);
          row.addSpacer(5); fixedText(row, info.value, 12, colors[provider.id], "bold"); row.addSpacer();
          if (counts[index] > capacities[index]) fixedText(row, "+" + (counts[index] - capacities[index]) + tr(" в подробностях"), 9, colors.muted);
        } else if (counts[index] > capacities[index]) fixedText(section, "+" + (counts[index] - capacities[index]) + tr(" в подробностях"), 9, colors.muted);
        section.addSpacer(tight ? 0 : 2);
        statisticsBlock(section, provider, colors, width, now, snapshot.timeZone);
        if (index < snapshot.providers.length - 1) {
          parent.addSpacer(tight ? 1 : compact ? 3 : 6);
          const divider = parent.addStack(); divider.size = new Size(width, 0.5); divider.backgroundColor = colors.track;
          parent.addSpacer(tight ? 1 : compact ? 3 : 6);
        }
      });
      parent.addSpacer();
      const outdated = snapshot.providers.some(provider => stale(provider.limitsState, now) || stale(provider.tokens.state, now) || stale((provider.activity || {}).state, now) ||
        provider.limits.some(window => window.retained) || (provider.id === "codex" && resetCreditInfo(provider, now).outdated));
      const footer = parent.addStack(); footer.centerAlignContent(); footer.addSpacer();
      fixedText(footer, (outdated ? tr("*Устарело · ") : "") + tr("По данным этого Mac · Токены с кэшем"), TYPE.footnote, colors.muted); footer.addSpacer();
    }

    function createWidget(snapshot, options, family, loadInfo = {}, now = Date.now()) {
      const selectedLanguage = (options.language || (snapshot && snapshot.language) || (snapshot ? "ru" : "en")) === "en" ? "en" : "ru";
      if (selectedLanguage !== language) return forLanguage(selectedLanguage).createWidget(snapshot, options, family, loadInfo, now);
      snapshot = displaySnapshot(snapshot);
      const widget = new ListWidget();
      widget.refreshAfterDate = new Date(now + 900000);
      widget.url = "scriptable:///run?scriptName=" + encodeURIComponent("AI Usage") + "&provider=" + options.provider + "&lang=" + language;
      const p = snapshot && (snapshot.providers.find(p => p.id === options.provider) || snapshot.providers[0]);
      if (!snapshot || !p) {
        widget.setPadding(12, 12, 12, 12);
        text(widget, "AI Usage", 15, null, "bold"); widget.addSpacer(5);
        const t = text(widget, tr("Открой Scriptable для настройки"), 11, null); t.lineLimit = 3;
        return widget;
      }
      const limits = selectedLimits(p, options), first = limits[0];
      const firstState = limitState(first, p.limitsState);
      const next = snapshot.providers.flatMap(p => p.limits).map(w => Date.parse(w.resetsAt)).filter(t => t > now);
      if (next.length) widget.refreshAfterDate = new Date(Math.min(now + 900000, Math.min(...next) + 1000));
      if (family === "accessoryCircular") {
        widget.setPadding(0, 0, 0, 0);
        const age = validDate(firstState.fetchedAt) ? Math.max(0, Math.floor((now - Date.parse(firstState.fetchedAt)) / 60000)) : null;
        const caption = resetDue(first, firstState, now) ? tr("обновить") : (stale(firstState, now) ? tr("устарело") : (age === null ? tr("нет данных") : age + tr("м назад")));
        const img = widget.addImage(ringImage(remaining(first, firstState, now), p.id === "claude" ? "CLAUDE" : "CODEX", caption, "FFFFFF"));
        img.imageSize = new Size(68, 68); img.centerAlignImage();
        return widget;
      }
      if (family === "accessoryInline") {
        text(widget, p.name + " " + pct(first, firstState, now) + " · " + (stale(firstState, now) ? tr("Устарело · ") + ageText(firstState.fetchedAt, now) : widgetResetText(first, firstState, now, snapshot.timeZone).replace(tr("Сброс · "), "↻ ")), 12, null);
        return widget;
      }
      if (family === "accessoryRectangular") {
        widget.setPadding(0, 0, 0, 0);
        text(widget, p.name + " · " + pct(first, firstState, now) + tr(" осталось"), 13, null, "bold");
        text(widget, widgetResetText(first, firstState, now, snapshot.timeZone), 11, null);
        freshness(widget, firstState.fetchedAt, null, 9, now);
        return widget;
      }
      const colors = palette(); widget.backgroundColor = colors.background; widget.setPadding(14, 16, 14, 16);
      const screenWidth = typeof Device.screenSize === "function" ? Device.screenSize().width : 390;
      const contentWidth = Math.min(350, Math.max(220, screenWidth - 92));
      if (family === "large" || family === "extraLarge") {
        const verticalPadding = contentWidth < 290 ? 10 : 12;
        widget.setPadding(verticalPadding, 16, verticalPadding, 16);
        largeWidget(widget, snapshot, colors, contentWidth, now, loadInfo);
      } else if (family === "small") {
        providerCard(widget, p, colors, Math.min(138, (screenWidth - 84) / 2 - 28), now, 3, snapshot.timeZone,
          options.group || options.limit ? selectedLimits(p, options) : p.limits);
      } else {
        widget.setPadding(10, 12, 10, 12);
        const row = widget.addStack(); row.layoutHorizontally();
        snapshot.providers.forEach((provider, i) => {
          if (i) row.addSpacer(16);
          const column = row.addStack(); column.layoutVertically();
          column.url = "scriptable:///run?scriptName=AI%20Usage&provider=" + provider.id + "&lang=" + language;
          providerCard(column, provider, colors, (contentWidth - 8) / snapshot.providers.length, now, 3, snapshot.timeZone);
        });
      }
      return widget;
    }

    async function loadSnapshot(local, cloud, downloadTimeout = 4500) {
      const cachePath = local.joinPath(local.documentsDirectory(), "AI Usage/cache.json");
      let cached = null;
      try { if (local.fileExists(cachePath)) cached = validateSnapshot(JSON.parse(local.readString(cachePath))); } catch (_) {}
      try {
        if (!cloud) throw new Error("icloud_disabled");
        const cloudPath = cloud.joinPath(cloud.documentsDirectory(), "AI Usage/snapshot.json");
        if (!cloud.fileExists(cloudPath)) throw new Error("waiting_for_sync");
        let timer;
        try {
          await Promise.race([
            cloud.downloadFileFromiCloud(cloudPath),
            new Promise((_, reject) => { timer = Timer.schedule(downloadTimeout, false, () => reject(new Error("sync_timeout"))); })
          ]);
        } finally { if (timer) timer.invalidate(); }
        if (cloud.fileSize(cloudPath) > 8192) throw new Error("snapshot_too_large");
        const candidate = validateSnapshot(JSON.parse(cloud.readString(cloudPath)));
        if (cached && Date.parse(candidate.generatedAt) < Date.parse(cached.generatedAt)) return { snapshot: cached, cached: true, reason: tr("iCloud доставляет более старый снимок") };
        try {
          local.createDirectory(local.joinPath(local.documentsDirectory(), "AI Usage"), true);
          const temporary = cachePath + ".tmp";
          local.writeString(temporary, JSON.stringify(candidate));
          // Local cache only; the iCloud snapshot is never modified by iPhone.
          if (local.fileExists(cachePath)) local.remove(cachePath);
          local.move(temporary, cachePath);
        } catch (_) { /* A read-only/locked cache must not hide a valid cloud snapshot. */ }
        return { snapshot: candidate, cached: false, reason: null };
      } catch (_) {
        return { snapshot: cached, cached: true, reason: cached ? tr("Показаны последние сохранённые данные") : tr("Снимок ещё не получен из iCloud") };
      }
    }

    function overviewHTML(data, now) {
      data = displaySnapshot(data);
      return data.providers.map(provider => {
        const state = provider.limitsState;
        const rows = provider.limits.map(w => {
          const value = remaining(w, state, now);
          return '<button class="quota-row" data-owner="' + esc(provider.id) + '" data-limit="' + esc(w.id) + '" aria-label="' + esc(limitLabel(w, provider) + tr(": осталось ") + pct(w, state, now) + tr(". Открыть историю")) + '">' +
            '<span class="quota-label">' + esc(limitLabel(w, provider)) + '</span><strong>' + esc(pct(w, state, now)) + '</strong>' +
            '<span class="track" aria-hidden="true"><i style="width:' + (value === null ? 0 : value) + '%"></i></span>' +
            '<span class="reset">' + esc(widgetResetText(w, state, now, data.timeZone)) + '</span></button>';
        }).join('');
        let resets = '';
        if (provider.id === 'codex') {
          const info = resetCreditInfo(provider, now), credits = provider.resetCredits;
          let note = info.note;
          if (credits && credits.availableCount > 0 && validDate(credits.nextExpiresAt) && Date.parse(credits.nextExpiresAt) > now) {
            const expiry = new Intl.DateTimeFormat(locale, { timeZone: data.timeZone, day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }).format(new Date(credits.nextExpiresAt));
            note += (note ? ' · ' : '') + tr("Один из сбросов истекает ") + expiry;
          }
          resets = ("<div class=\"reset-credits\"><span>" + tr("Сбросы") + "</span><strong>") + esc(info.value) + '</strong>' +
            (note ? '<small>' + esc(note) + '</small>' : '') + '</div>';
        }
        const activity = activityTotal(provider, 1, now, data.timeZone);
        const activityLine = ("<div class=\"activity-strip\"><span>" + tr("Сегодня")) + (stale((provider.activity || {}).state, now) ? '*' : '') + '</span>' +
          ("<span>" + tr("Промпты ") + "<b>") + compactNumber(activity.prompts) + ("</b></span><span>" + tr("Сессии ") + "<b>") + compactNumber(activity.sessions) + '</b></span></div>';
        return '<section class="provider-section" aria-labelledby="heading-' + provider.id + '" style="--accent:var(--' + provider.id + ')">' +
          '<div class="provider-heading"><h2 id="heading-' + provider.id + '"><span class="mark" aria-hidden="true"></span>' + esc(providerName(provider)) + '</h2>' +
          '<span class="source-age">' + esc(ageText(state.fetchedAt, now)) + '</span></div>' +
          (stale(state, now) ? '<p class="source-note">' + esc(sourceMessage(state)) + '</p>' : '') +
          (provider.limits.some(w => w.retained) ? ("<p class=\"source-note\">" + tr("* Часть лимитов не обновилась. Показаны последние полученные данные.") + "</p>") : '') +
          (rows || ("<p class=\"unavailable\">" + tr("Лимиты пока недоступны") + "</p>")) + resets + activityLine + '</section>';
      }).join('');
    }

    function dashboardRuntime(data, info, initialProvider) {
      const U = window.AIUsageHelpers, e = U.esc;
      let providerID = initialProvider || 'codex', range = '24h', metric = 'limits', limitID = null;
      let analyticsOpen = false, connectionOpen = false;
      const root = document.getElementById('root');
      function render() {
        const now = Date.now();
        if (!data) {
          root.innerHTML = ("<header><h1>" + tr("Лимиты подписок") + "</h1></header><section class=\"setup\"><h2>" + tr("Подключи Scriptable") + "</h2><ol><li>" + tr("Включи iCloud Drive для Scriptable на iPhone.") + "</li><li>" + tr("Используй один Apple Account на Mac и iPhone.") + "</li><li>" + tr("Запусти установщик AI Usage на Mac.") + "</li><li>" + tr("Дождись синхронизации и открой скрипт повторно.") + "</li></ol><p class=\"note\">" + tr("Данные ещё не получены.") + "</p></section>");
          return;
        }
        const p = data.providers.find(provider => provider.id === providerID) || data.providers[0];
        const selected = p.limits.find(w => w.id === limitID) || p.limits[0];
        limitID = selected ? selected.id : null;
        root.style.setProperty('--accent', 'var(--' + p.id + ')');
        let graph;
        if (metric === 'limits') {
          graph = U.historySegments(p, limitID, range, now).length ? U.chartSVG(p, limitID, range, now) : ("<p class=\"empty\">" + tr("История появится после первых обновлений.") + "</p>");
        } else {
          const days = range === '30d' ? 30 : range === '7d' ? 7 : 1;
          const today = U.dayKey(now, data.timeZone), end = Date.parse(today + 'T12:00:00Z');
          const map = new Map(p.tokens.daily.map(row => [row.date, row.totalTokens]));
          const buckets = Array.from({ length: days }, (_, i) => { const date = new Date(end - (days - 1 - i) * 86400000).toISOString().slice(0, 10); return { date, value: map.has(date) ? map.get(date) : null }; });
          const max = Math.max(1, ...buckets.map(b => b.value || 0));
          graph = ("<div class=\"bars\" role=\"img\" aria-label=\"" + tr("Токены по дням") + "\">") + buckets.map(b => '<div title="' + e(b.date + ': ' + (b.value === null ? tr("нет данных") : b.value + tr(" токенов"))) + '"><i class="' + (b.value === null ? 'missing' : '') + '" style="height:' + (b.value === null ? 2 : Math.max(2, b.value / max * 100)) + 'px"></i></div>').join('') + '</div>';
        }
        const tokenCards = [1, 7, 30].map(days => {
          const total = U.tokenTotal(p, days, now, data.timeZone);
          return '<div><span>' + (days === 1 ? tr("Сегодня") : days + tr(" дней")) + '</span><b>' + U.compactNumber(total.value) + '</b><small>' + total.days + (tr(total.days === 1 ? " день с данными" : " дн. с данными") + "</small></div>");
        }).join('');
        const detailDays = range === '30d' ? 30 : range === '7d' ? 7 : 1;
        const breakdown = U.tokenBreakdown(p, detailDays, now, data.timeZone);
        const breakdownRows = [['input', tr("Вход без кэша")], ['cacheRead', tr("Чтение кэша")],
          ...(p.id === 'claude' ? [['cacheWrite', tr("Запись кэша")]] : []), ['output', tr("Ответы модели")]];
        const tokenDetails = ("<div class=\"token-breakdown\"><h3>" + tr("Состав токенов · ")) + (detailDays === 1 ? tr("сегодня") : detailDays + tr(" дней")) + '</h3>' +
          breakdownRows.map(([key, label]) => '<div class="status-row"><span>' + label + '</span><b>' + U.compactNumber(breakdown[key]) + '</b></div>').join('') +
          ("<p class=\"note\">" + tr("Общий счётчик включает чтение кэша. Доля кэшированного входа: ")) + (breakdown.cachePercent === null ? '—' : Math.round(breakdown.cachePercent) + '%') + '.</p></div>';
        const activityRows = [1, 7, 30].map(days => {
          const a = U.activityTotal(p, days, now, data.timeZone);
          return '<tr><td>' + (days === 1 ? tr("Сегодня") : days + tr(" дней")) + '</td><td>' + U.compactNumber(a.prompts) + '</td><td>' +
            U.compactNumber(a.sessions) + '</td><td>' + U.compactNumber(a.activeDays) + '</td></tr>';
        }).join('');
        const activityState = (p.activity || {}).state || {};
        const activityDetails = ("<div class=\"token-summary\"><h3>" + tr("Промпты и сессии · этот Mac") + "</h3><table class=\"activity-table\"><thead><tr><th>" + tr("Период") + "</th><th>" + tr("Промпты") + "</th><th>" + tr("Сессии") + "</th><th>" + tr("Актив. дни") + "</th></tr></thead><tbody>") + activityRows +
          ("</tbody></table><p class=\"note\">" + tr("Промпты — пользовательские сообщения без служебных событий и заданий подагентов. Сессии — уникальные диалоги с промптами за период; продолжение диалога не создаёт новую сессию.") + "</p>") +
          ("<p class=\"note\">" + tr("Обновлено ")) + e(U.ageText(activityState.fetchedAt, now)) + (U.stale(activityState, now) ? tr(" · данные недоступны или устарели") : '') + '</p></div>';
        const statusRows = data.providers.map(provider => '<div class="connection-provider"><h3>' + e(U.providerName(provider)) + '</h3>' +
          ("<div class=\"status-row\"><span>" + tr("Лимиты") + "</span><b>") + e(provider.limitsState.state === 'ok' ? (U.stale(provider.limitsState, now) ? tr("Данные устарели") : tr("Получены")) : U.sourceMessage(provider.limitsState)) + '</b></div>' +
          ("<div class=\"status-row\"><span>" + tr("Токены Mac") + "</span><b>") + e(provider.tokens.state.state === 'ok' ? (U.stale(provider.tokens.state, now) ? tr("Данные устарели") : tr("Получены")) : U.sourceMessage(provider.tokens.state)) + '</b></div>' +
          ("<div class=\"status-row\"><span>" + tr("Активность Mac") + "</span><b>") + e(!provider.activity ? tr("Недоступна") : provider.activity.state.state === 'ok' ? (U.stale(provider.activity.state, now) ? tr("Данные устарели") : tr("Получена")) : U.sourceMessage(provider.activity.state)) + '</b></div></div>').join('');
        root.innerHTML = ("<header><div><span class=\"app-name\">AI Usage</span><h1>" + tr("Лимиты подписок") + "</h1></div><span class=\"sync-label\">") + (info.cached ? tr("Кэш") : 'iCloud') + '</span></header>' +
          ("<div class=\"overview-label\"><span>" + tr("Лимиты подписок") + "</span><span>" + tr("Осталось") + "</span></div><div class=\"overview\">") + U.overviewHTML(data, now) + '</div>' +
          '<details id="analytics"' + (analyticsOpen ? ' open' : '') + ("><summary>" + tr("История и активность") + "<span aria-hidden=\"true\" class=\"chevron\">⌄</span></summary><div class=\"details-content\">") +
          ("<div class=\"filters\"><label class=\"sr-only\" for=\"provider\">" + tr("Сервис") + "</label><select id=\"provider\">") + data.providers.map(provider => '<option value="' + provider.id + '"' + (provider.id === p.id ? ' selected' : '') + '>' + e(U.providerName(provider)) + '</option>').join('') +
          '</select><div class="segmented">' + ['limits', 'tokens'].map(m => '<button data-metric="' + m + '" aria-pressed="' + (m === metric) + '">' + (m === 'limits' ? tr("Лимиты") : tr("Токены")) + '</button>').join('') + '</div></div>' +
          (metric === 'limits' && p.limits.length ? ("<label class=\"select-label\" for=\"window\">" + tr("Окно лимита") + "</label><select id=\"window\">") + p.limits.map(w => '<option value="' + e(w.id) + '"' + (w.id === limitID ? ' selected' : '') + '>' + e(U.limitLabel(w, p)) + '</option>').join('') + '</select>' : '') +
          '<div class="graph-label">' + (metric === 'limits' ? tr("Использовано · 0–100%") : tr("Токены по дням")) + '</div><div class="graph">' + graph + '</div><div class="ranges">' + ['24h', '7d', '30d'].map(r => '<button data-range="' + r + '" aria-pressed="' + (r === range) + '">' + (r === '24h' ? (metric === 'tokens' ? tr("Сегодня") : tr("24 часа")) : r === '7d' ? tr("7 дней") : tr("30 дней")) + '</button>').join('') + '</div>' +
          '<p class="note">' + (metric === 'limits' ? tr("Разрывы: сброс лимита или нет наблюдений.") : tr("Пропуски не означают нулевой расход.")) + '</p>' +
          ("<div class=\"token-summary\"><h3>" + tr("Токены · по данным этого Mac") + "</h3><div class=\"token-cards\">") + tokenCards + ("</div><p class=\"note\">" + tr("Обновлено ")) + e(U.ageText(p.tokens.state.fetchedAt, now)) + (U.stale(p.tokens.state, now) ? tr(" · данные могут быть устаревшими") : '') + '</p>' + tokenDetails + '</div>' + activityDetails + '</div></details>' +
          '<details id="connection"' + (connectionOpen ? ' open' : '') + ("><summary>" + tr("Синхронизация") + "<span aria-hidden=\"true\" class=\"chevron\">⌄</span></summary><div class=\"details-content\">") + statusRows +
          ("<div class=\"status-row\"><span>" + tr("Снимок Mac") + "</span><b>") + e(U.ageText(data.generatedAt, now)) + ("</b></div><div class=\"status-row\"><span>" + tr("Часовой пояс") + "</span><b>") + e(data.timeZone) + '</b></div>' +
          (info.reason ? '<p class="note">' + e(tr(info.reason)) + '</p>' : '') + ("<p class=\"note\">" + tr("Mac собирает данные каждые 5 минут, пока не спит. Время доставки и обновления виджета зависит от iCloud и iOS.") + "</p></div></details>");
        const analytics = root.querySelector('#analytics'), connection = root.querySelector('#connection');
        analytics.ontoggle = () => { analyticsOpen = analytics.open; };
        connection.ontoggle = () => { connectionOpen = connection.open; };
        root.querySelectorAll('[data-limit]').forEach(button => button.onclick = () => {
          providerID = button.dataset.owner; limitID = button.dataset.limit; metric = 'limits'; analyticsOpen = true; render();
          root.querySelector('#analytics').scrollIntoView({ block: 'start', behavior: 'smooth' });
        });
        root.querySelectorAll('[data-range]').forEach(button => button.onclick = () => { range = button.dataset.range; render(); });
        root.querySelectorAll('[data-metric]').forEach(button => button.onclick = () => { metric = button.dataset.metric; render(); });
        root.querySelector('#provider').onchange = event => { providerID = event.target.value; limitID = null; render(); };
        const select = root.querySelector('#window'); if (select) select.onchange = () => { limitID = select.value; render(); };
      }
      render();
      setInterval(render, 60000);
    }

    function dashboardHTML(snapshot, loadInfo = {}, provider = "codex", overrideLanguage = null) {
      const selectedLanguage = (overrideLanguage || (snapshot && snapshot.language) || (snapshot ? "ru" : "en")) === "en" ? "en" : "ru";
      if (selectedLanguage !== language) return forLanguage(selectedLanguage).dashboardHTML(snapshot, loadInfo, provider, selectedLanguage);
      snapshot = displaySnapshot(snapshot);
      const helpers = { tr, sourceMessage, esc, validDate, finite, clamp, ageText, stale, limitState, resetDue, remaining, pct, resetCreditInfo, windowLabel, resetText, widgetResetText, selectedLimits, displayLimits, displaySnapshot, providerName, limitLabel, nativeLimitLabel, overviewHTML, dayKey, tokenTotal, tokenBreakdown, activityTotal, compactNumber, historySegments, chartSVG };
      const declarations = Object.entries(helpers).map(([name, fn]) => 'const ' + name + '=' + fn.toString() + ';').join('\n');
      const safeJSON = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
      const css = `
        :root{--bg:#fff;--text:#222;--muted:#767676;--line:#ededed;--surface:#f6f6f6;--claude:#b2765e;--codex:#398577;--accent:var(--codex);font-family:-apple-system,BlinkMacSystemFont,sans-serif;color-scheme:light dark}
        *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-size:13px;-webkit-font-smoothing:antialiased}#root{max-width:560px;margin:auto;padding:28px 22px max(30px,env(safe-area-inset-bottom))}header{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px}.app-name{font-size:11px;color:var(--muted)}h1{font-size:23px;letter-spacing:-.65px;font-weight:600;margin:7px 0 0}h2{font-size:14px;font-weight:600;margin:0;display:flex;align-items:center;gap:8px}h3{font-size:12px;font-weight:500;margin:0 0 13px}.sync-label{font-size:11px;color:var(--muted)}.overview-label{display:flex;justify-content:space-between;color:var(--muted);font-size:10px;margin-bottom:10px}.provider-section{border:1px solid var(--line);border-radius:12px;padding:17px 16px 2px;margin-bottom:14px}.provider-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}.mark{width:6px;height:6px;border-radius:50%;background:var(--accent)}.source-age{color:var(--muted);font-size:10px;white-space:nowrap}.source-note{font-size:11px;color:#a56a39;margin:10px 0 0;line-height:1.5}.unavailable{color:var(--muted);font-size:12px;margin:18px 0}
        button,select{font:inherit;color:inherit}button{cursor:pointer;-webkit-tap-highlight-color:transparent}button:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px}.quota-row{border:0;border-bottom:1px solid var(--line);background:transparent;width:100%;padding:14px 0 13px;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px 14px;align-items:baseline}.quota-row:last-child{border-bottom:0}.quota-row:active{opacity:.65}.quota-label{font-size:12px;line-height:1.3;overflow-wrap:anywhere}.quota-row strong{font-size:19px;font-weight:500;letter-spacing:-.5px;font-variant-numeric:tabular-nums}.track{grid-column:1/-1;height:3px;background:var(--line);display:block;border-radius:2px;overflow:hidden}.track i{display:block;height:100%;background:var(--accent);border-radius:2px}.reset{grid-column:1/-1;color:var(--muted);font-size:10px;line-height:1.3}
        .activity-strip{display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-size:10px;padding:12px 0}.activity-strip b{color:var(--accent);font-weight:600;margin-left:4px}.activity-table{border-collapse:collapse;width:100%;font-size:11px;font-variant-numeric:tabular-nums}.activity-table td,.activity-table th{padding:10px 3px;border-bottom:1px solid var(--line);text-align:right}.activity-table td:first-child,.activity-table th:first-child{text-align:left}.activity-table th{font-weight:400;color:var(--muted)}.token-breakdown{margin-top:22px}
        .reset-credits{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px 14px;padding:14px 0;font-size:12px}.reset-credits strong{font-size:20px;font-weight:600;color:var(--codex);font-variant-numeric:tabular-nums}.reset-credits small{grid-column:1/-1;color:var(--muted);font-size:10px;line-height:1.5}
        details{border-bottom:1px solid var(--line);scroll-margin-top:18px}summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;list-style:none;min-height:52px;font-size:12px;font-weight:500}summary::-webkit-details-marker{display:none}.chevron{color:var(--muted);font-size:16px;transition:transform .15s}details[open]>summary .chevron{transform:rotate(180deg)}.details-content{padding:4px 0 21px}.filters{display:flex;gap:12px;align-items:center;margin-bottom:14px}.filters>select{flex:1;width:40%}select{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:9px 8px;font-size:11px;min-width:0;width:100%;min-height:36px}.segmented,.ranges{display:flex;gap:2px}.segmented{border:1px solid var(--line);border-radius:6px;padding:2px}.segmented button,.ranges button{background:transparent;border:0;padding:8px 12px;border-radius:4px;font-size:11px;color:var(--muted);min-height:32px}button[aria-pressed=true]{background:var(--surface);color:var(--text)}.select-label{display:block;font-size:10px;color:var(--muted);margin:0 0 6px}.graph-label{font-size:10px;color:var(--muted);margin:19px 0 9px}.graph{color:var(--accent)}svg{width:100%;height:auto;display:block;min-height:95px}.ranges{justify-content:center;margin-top:10px}.note{color:var(--muted);font-size:10px;line-height:1.6;margin:13px 0 0}.empty{padding:30px 0;text-align:center;color:var(--muted);font-size:12px;line-height:1.6}.token-summary{margin-top:22px;padding-top:20px;border-top:1px solid var(--line)}.token-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.token-cards span{display:block;font-size:10px;color:var(--muted)}.token-cards b{display:block;font-size:20px;font-weight:500;letter-spacing:-.5px;margin:7px 0}.token-cards small{font-size:9px;color:var(--muted)}.connection-provider{padding:12px 0 18px;border-bottom:1px solid var(--line);margin-bottom:8px}.status-row{display:flex;justify-content:space-between;gap:16px;padding-top:11px;font-size:11px;line-height:1.5}.status-row span{color:var(--muted);flex-shrink:0}.status-row b{font-weight:400;text-align:right}.bars{height:120px;display:flex;align-items:end;gap:4px;border-bottom:1px solid var(--line)}.bars>div{flex:1;display:flex;justify-content:center;align-items:end;height:100%}.bars i{background:var(--accent);width:100%;max-width:40px;border-radius:2px 2px 0 0}.bars i.missing{background:var(--line)}.setup{border-top:1px solid var(--line);padding-top:20px}ol{padding-left:18px;line-height:1.7;color:var(--muted)}li{padding:5px 0}.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
        @media(prefers-color-scheme:dark){:root{--bg:#171717;--text:#eee;--muted:#999;--line:#303030;--surface:#282828;--claude:#cb9b84;--codex:#79ae9f}.source-note{color:#c79b72}}
        @media(max-width:350px){#root{padding-left:16px;padding-right:16px}.provider-section{padding-left:13px;padding-right:13px}.filters{gap:6px}.segmented button{padding:8px}}
      `;
      return '<!doctype html><html lang="' + language + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="light dark"><title>AI Usage</title><style>' + css + '</style></head><body><main id="root"></main><script>' + 'const language=' + safeJSON(language) + ';const locale=' + safeJSON(locale) + ';const ENGLISH=' + safeJSON(ENGLISH) + ';' + declarations + '\nconst RANGE_MS=' + safeJSON(RANGE_MS) + ';window.AIUsageHelpers={' + Object.keys(helpers).join(',') + '};(' + dashboardRuntime.toString() + ')(' + safeJSON(snapshot) + ',' + safeJSON(loadInfo) + ',' + safeJSON(provider) + ');</script></body></html>';
    }

    async function run() {
      const options = parseOptions((args.widgetParameter || args.queryParameters.provider || "codex") + (args.queryParameters.lang ? ";lang=" + args.queryParameters.lang : ""));
      let cloud = null;
      try { cloud = FileManager.iCloud(); } catch (_) {}
      const info = await loadSnapshot(FileManager.local(), cloud);
      if (config.runsInWidget) {
        const widget = createWidget(info.snapshot, options, config.widgetFamily, info);
        Script.setWidget(widget);
      } else {
        const view = new WebView();
        view.shouldAllowRequest = request => request.url === "about:blank" || request.url.startsWith("data:");
        await view.loadHTML(dashboardHTML(info.snapshot, { cached: info.cached, reason: info.reason }, options.provider, options.language));
        await view.present(false);
      }
      Script.complete();
    }

    return { language, forLanguage, tr, sourceMessage, validateSnapshot, parseOptions, ageText, stale, limitState, resetDue, remaining, pct, windowLabel, resetText, widgetResetText,
      resetCreditInfo, readingTime, quotaCaptionLines, widgetFreshness, selectedLimits, displayLimits, displaySnapshot, providerName, limitLabel, nativeLimitLabel, overviewHTML, dayKey, tokenTotal, tokenBreakdown, activityTotal, compactNumber, historySegments, chartSVG, createWidget, loadSnapshot, dashboardHTML, run };
  }
  return forLanguage("ru");
})();

module.exports = AIUsage;
