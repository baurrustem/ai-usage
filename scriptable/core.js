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
  "Источник Claude CLI недоступен; проверь вход на Mac": "Claude CLI unavailable; check sign-in on Mac",
  "При текущем темпе кончится ~": "At this pace it runs out ~",
  "При текущем темпе хватит до сброса": "At this pace it lasts until the reset",
  "кончится ~": "runs out ~",
  ": лимит обновился": ": limit reset",
  "Можно продолжать работу": "You can get back to work",
  "Темп последнего часа. ": "Pace of the last hour. ",
  "AI Usage: данные не приходят с Mac": "AI Usage: no data from the Mac",
  "Последнее обновление ": "Last update ",
  ". Проверь, что Mac включён, и запусти ai-usage doctor": ". Check that the Mac is on and run ai-usage doctor",
  ": лимиты не обновляются": ": limits are not updating",
  "Последние лимиты ": "Last limits ",
  ". Запусти на Mac: ai-usage doctor": ". Run on the Mac: ai-usage doctor",
  "Кончится ~": "Runs out ~",
  "Хватит до ": "Lasts until ",
  "Обновится ": "Renews ",
  " без лимита до ": " without quota until ",
  "осталось": "left",
  "токенов сегодня": "tokens today",
  "промптов": "prompts",
  "Сбросов: ": "Resets: ",
  "Данные устарели · ": "Stale data · ",
  "через ": "in ",
  "кэш": "cached",
  "Кончится": "Runs out",
  "сброс ": "reset ",
  "Хватит до": "Lasts until",
  "Обновится": "Renews",
  "прогноза пока нет · через ": "no forecast yet · in ",
  "прогноз только на 6 ч · через ": "too far to forecast · in "
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

    function forecastText(window, state, now = Date.now(), timeZone = "UTC") {
      const pace = window && window.forecast;
      if (!pace || window.retained || stale(limitState(window, state), now) || resetDue(window, state, now)) return null;
      if (validDate(pace.exhaustsAt)) {
        const at = Date.parse(pace.exhaustsAt);
        if (at <= now || (validDate(window.resetsAt) && at >= Date.parse(window.resetsAt))) return null;
        const sameDay = dayKey(now, timeZone) === dayKey(at, timeZone);
        const format = sameDay ? { hour: "2-digit", minute: "2-digit" } : { weekday: "short", hour: "2-digit", minute: "2-digit" };
        const time = new Intl.DateTimeFormat(locale, { timeZone, ...format }).format(new Date(at));
        return { warn: true, at: pace.exhaustsAt, text: tr("При текущем темпе кончится ~") + time, short: tr("кончится ~") + time };
      }
      return finite(pace.atResetPercent) ? { warn: false, at: null, text: tr("При текущем темпе хватит до сброса"), short: "" } : null;
    }

    function plannedNotifications(snapshot, now = Date.now()) {
      if (!snapshot || (snapshot.notifications && snapshot.notifications.enabled === false)) return [];
      const out = [], slot = at => Math.round(Date.parse(at) / 600000);
      if (now - Date.parse(snapshot.generatedAt) > 86400000) {
        return [{ id: "stale:" + snapshot.generatedAt, kind: "stale", at: null, title: tr("AI Usage: данные не приходят с Mac"),
          body: tr("Последнее обновление ") + ageText(snapshot.generatedAt, now) + tr(". Проверь, что Mac включён, и запусти ai-usage doctor") }];
      }
      const fresh = now - Date.parse(snapshot.generatedAt) <= 3600000;
      for (const provider of displaySnapshot(snapshot).providers) {
        const state = provider.limitsState;
        if (fresh && (!validDate(state.fetchedAt) || now - Date.parse(state.fetchedAt) > 6 * 3600000)) {
          out.push({ id: "source:" + provider.id + ":" + (state.fetchedAt || "none"), kind: "source", at: null,
            title: providerName(provider) + tr(": лимиты не обновляются"),
            body: tr("Последние лимиты ") + ageText(state.fetchedAt, now) + " · " + sourceMessage(state) + tr(". Запусти на Mac: ai-usage doctor") });
          continue;
        }
        if (stale(state, now)) continue;
        for (const w of provider.limits) {
          if (!validDate(w.resetsAt) || Date.parse(w.resetsAt) <= now) continue;
          const label = providerName(provider) + " · " + limitLabel(w, provider);
          if (clamp(w.usedPercent) !== null && clamp(w.usedPercent) >= 80)
            out.push({ id: "reset:" + provider.id + ":" + w.id + ":" + slot(w.resetsAt), kind: "reset", at: w.resetsAt,
              title: label + tr(": лимит обновился"), body: tr("Можно продолжать работу") });
          const pace = forecastText(w, state, now, snapshot.timeZone);
          if (pace && pace.warn && Date.parse(pace.at) - now <= 3 * 3600000)
            out.push({ id: "pace:" + provider.id + ":" + w.id + ":" + slot(w.resetsAt), kind: "pace", at: null,
              title: label + ": " + pace.short, body: tr("Темп последнего часа. ") + widgetResetText(w, state, now, snapshot.timeZone) });
        }
      }
      return out;
    }

    async function deliverNotifications(snapshot, now = Date.now()) {
      if (typeof Notification === "undefined") return 0;
      const planned = plannedNotifications(snapshot, now);
      if (!planned.length) return 0;
      const files = FileManager.local(), path = files.joinPath(files.documentsDirectory(), "ai-usage-notified.json");
      let sent = [];
      try { if (files.fileExists(path)) sent = JSON.parse(files.readString(path)); } catch (_) { sent = []; }
      if (!Array.isArray(sent)) sent = [];
      let count = 0;
      for (const item of planned) {
        if (sent.includes(item.id)) continue;
        const note = new Notification();
        note.identifier = item.id; note.threadIdentifier = "ai-usage"; note.title = item.title; note.body = item.body;
        if (item.at) note.setTriggerDate(new Date(item.at));
        await note.schedule();
        sent.push(item.id); count++;
      }
      files.writeString(path, JSON.stringify(sent.slice(-200)));
      return count;
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







    function fixedText(parent, value, size, color, weight = "regular") {
      const label = text(parent, value, size, color, weight);
      label.minimumScaleFactor = 1;
      return label;
    }

    // Explicit trailing spacers pin native text to the leading edge of each fixed-width cell.
















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
      if (validDate(window.resetsAt)) {
        const at = readingTime(window.resetsAt, now, timeZone);
        const dateOnly = provider.id === "claude" || (provider.id === "codex" && window.windowMinutes === 300);
        return dateOnly ? [at] : [tr("Сброс"), at];
      }
      if (finite(window.usedPercent)) return [tr("Время сброса"), tr("Не получено")];
      return [tr("Нет данных"), window.title === "Fable" ? tr("о лимите Fable") : tr("о лимите")];
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



    // ---- Package widgets (1.1): each provider is a colour field, its riskiest limit leads,
    // and the range bar shows how far the quota carries you before the reset.
    const FIELD = { claude: ["B0482A", "9C4124"], codex: ["1C6A55", "15513F"] };
    function packagePalette() {
      const dark = Device.isUsingDarkAppearance();
      return { dark, ground: new Color(dark ? "111111" : "E9E4DA"), field: id => new Color(FIELD[id][dark ? 1 : 0]),
        stale: new Color(dark ? "3B3A37" : "66625B"), ink: new Color("FFF6EA"), inkSoft: new Color("FFF6EA", 0.78),
        inkFaint: new Color("FFF6EA", 0.26), amber: new Color("FFB020"), amberInk: new Color("1E1405") };
    }

    function widgetMetrics(screenWidth) {
      // Home-screen widget sizes in points by device width (Apple HIG); unknown widths take the next smaller class.
      if (screenWidth >= 428) return { small: 170, width: 364, medium: 170, large: 382 };
      if (screenWidth >= 390) return { small: 158, width: 338, medium: 158, large: 354 };
      if (screenWidth >= 375) return { small: 155, width: 329, medium: 155, large: 345 };
      return { small: 141, width: 292, medium: 141, large: 311 };
    }

    function displayFont(size) {
      try { if (typeof Font === "function") return new Font("DINCondensed-Bold", size); } catch (_) {}
      return Font.boldSystemFont(size);
    }

    function uiFont(size, weight = "regular") {
      return weight === "bold" ? Font.boldSystemFont(size) : weight === "semibold" ? Font.semiboldSystemFont(size) :
        weight === "medium" ? Font.mediumSystemFont(size) : Font.systemFont(size);
    }

    function paint(ctx, value, x, y, w, h, font, color, align = "left") {
      ctx.setFont(font); ctx.setTextColor(color);
      if (align === "right" && ctx.setTextAlignedRight) ctx.setTextAlignedRight();
      else if (align === "center") ctx.setTextAlignedCenter();
      else if (ctx.setTextAlignedLeft) ctx.setTextAlignedLeft();
      ctx.drawTextInRect(String(value), new Rect(x, y, w, h));
    }

    function pill(ctx, x, y, w, h, color) {
      ctx.setFillColor(color);
      const path = new Path();
      if (path.addRoundedRect && ctx.fillPath) { path.addRoundedRect(new Rect(x, y, w, h), h / 2, h / 2); ctx.addPath(path); ctx.fillPath(); }
      else ctx.fillRect(new Rect(x, y, w, h));
    }

    function clockText(at, now, timeZone) {
      const date = new Date(at), sameDay = dayKey(now, timeZone) === dayKey(date.getTime(), timeZone);
      const format = sameDay ? { hour: "2-digit", minute: "2-digit" } : { weekday: "short", hour: "2-digit", minute: "2-digit" };
      return new Intl.DateTimeFormat(locale, { timeZone, ...format }).format(date);
    }

    function durationText(minutes) {
      minutes = Math.max(1, Math.round(minutes));
      if (minutes < 60) return minutes + tr(" мин");
      const days = Math.floor(minutes / 1440), hours = Math.floor(minutes % 1440 / 60);
      return days ? days + tr(" дн") + (hours ? " " + hours + tr(" ч") : "") : hours + tr(" ч") + (minutes % 60 ? " " + minutes % 60 + tr(" мин") : "");
    }

    function bindingLimit(provider, now) {
      // At-risk first; then the account-wide window with a pace; then the account-wide window with least left.
      // Model-specific windows (Fable, Spark) lead only when nothing account-wide is readable.
      const state = provider.limitsState, live = provider.limits.filter(w => remaining(w, state, now) !== null);
      const general = live.filter(w => (w.groupId || provider.id) === provider.id);
      const pace = w => validDate(w.resetsAt) && Date.parse(w.resetsAt) - now <= 6 * 3600000 && forecastText(w, state, now);
      const least = list => list.slice().sort((a, b) => remaining(a, state, now) - remaining(b, state, now))[0];
      return live.find(w => { const f = pace(w); return f && f.warn; }) || least(general.filter(pace)) || least(general) ||
        least(live) || provider.limits[0] || null;
    }

    function packageVerdict(window, provider, now, timeZone) {
      const state = provider.limitsState;
      if (!window) return { text: sourceCaption(state), detail: "", fraction: null, mood: "missing" };
      if (window.retained || stale(limitState(window, state), now))
        return { text: tr("Данные устарели · ") + ageText(window.retained ? window.observedAt : state.fetchedAt, now), detail: sourceMessage(state), fraction: null, mood: "stale" };
      if (resetDue(window, state, now)) return { text: tr("Ожидается обновление"), detail: "", fraction: null, mood: "due" };
      if (!validDate(window.resetsAt)) return { text: tr("Время сброса недоступно"), detail: "", fraction: null, mood: "plain" };
      const reset = Date.parse(window.resetsAt), resetClock = clockText(window.resetsAt, now, timeZone);
      const pace = forecastText(window, state, now, timeZone);
      if (pace && pace.warn) {
        const out = Date.parse(pace.at);
        return { text: tr("Кончится ~") + clockText(pace.at, now, timeZone), label: tr("Кончится"), clock: "~" + clockText(pace.at, now, timeZone), resetClock, mood: "warn",
          detail: "~" + durationText((reset - out) / 60000) + tr(" без лимита до ") + resetClock,
          fraction: (out - now) / (reset - now) };
      }
      if (pace && reset - now <= 6 * 3600000) return { text: tr("Хватит до ") + resetClock, label: tr("Хватит до"), clock: resetClock, resetClock, mood: "ok", fraction: 1,
        detail: language === "en" ? "about " + Math.max(0, 100 - window.forecast.atResetPercent) + "% left at reset"
          : "к сбросу останется ~" + Math.max(0, 100 - window.forecast.atResetPercent) + "%" };
      return { text: tr("Обновится ") + resetClock, label: tr("Обновится"), clock: resetClock, resetClock,
        detail: (reset - now > 6 * 3600000 ? tr("прогноз только на 6 ч · через ") : tr("прогноза пока нет · через ")) + durationText((reset - now) / 60000),
        fraction: null, mood: "plain" };
    }

    function rangeBar(ctx, x, y, w, h, verdict, P, ends = true) {
      // A time axis from now (left) to the reset (right): the cream run is how far the quota carries you.
      pill(ctx, x, y, w, h, P.inkFaint);
      if (ends) { ctx.setFillColor(P.ink); ctx.fillRect(new Rect(x, y - 3, 1.5, h + 6)); ctx.fillRect(new Rect(x + w - 1.5, y - 3, 1.5, h + 6)); }
      if (verdict.fraction === null) return;
      const covered = Math.max(h, Math.min(w, w * Math.max(0, verdict.fraction)));
      pill(ctx, x, y, covered, h, P.ink);
      if (verdict.mood !== "warn") return;
      ctx.setFillColor(P.amber);
      for (let stripe = x + covered + 3; stripe + 2.5 <= x + w - h / 2; stripe += 5) ctx.fillRect(new Rect(stripe, y + 1, 2.5, h - 2));
    }

    function creditsText(provider, now) {
      const credits = resetCreditInfo(provider, now);
      return tr("Сбросов: ") + credits.value + (credits.outdated ? "*" : "");
    }

    function leftOf(window, provider) {
      return language === "en" ? "left · " + nativeLimitLabel(window, provider) + " limit" : "осталось · лимит «" + nativeLimitLabel(window, provider) + "»";
    }

    function verdictBlock(ctx, verdict, x, y, w, h, P, clockSize) {
      // The verdict is the second display numeral: a small label over the clock, on amber when it runs out.
      const warn = verdict.mood === "warn", ink = warn ? P.amberInk : P.ink;
      if (warn) { ctx.setFillColor(P.amber); const path = new Path();
        if (path.addRoundedRect && ctx.fillPath) { path.addRoundedRect(new Rect(x, y, w, h), 12, 12); ctx.addPath(path); ctx.fillPath(); } else ctx.fillRect(new Rect(x, y, w, h)); }
      const inset = warn ? 11 : 0;
      if (verdict.clock) {
        paint(ctx, verdict.label, x + inset, y + (warn ? 7 : 3), w - inset * 2, 15, uiFont(12, "bold"), ink);
        paint(ctx, verdict.clock, x + inset - 1, y + (warn ? 20 : 16), w - inset * 2, clockSize + 6, displayFont(clockSize), ink);
      } else paint(ctx, verdict.text, x + inset, y + 4, w - inset * 2, h - 8, uiFont(13, "bold"), ink);
    }

    function packageCard(parent, provider, P, width, height, now, timeZone, size, loadInfo = {}) {
      const state = provider.limitsState, lead = bindingLimit(provider, now), verdict = packageVerdict(lead, provider, now, timeZone);
      const drained = verdict.mood === "stale" || verdict.mood === "missing";
      const card = parent.addStack(); card.size = new Size(width, height); card.setPadding(0, 0, 0, 0);
      card.backgroundColor = drained ? P.stale : P.field(provider.id);
      card.cornerRadius = size === "large" ? 15 : 0;
      card.url = "scriptable:///run?scriptName=AI%20Usage&provider=" + provider.id + "&lang=" + language;
      const ctx = new DrawContext(); ctx.size = new Size(width, height); ctx.opaque = false; ctx.respectScreenScale = true;
      const pad = size === "small" ? 13 : 15, inner = width - pad * 2, numberInk = drained ? P.inkSoft : P.ink;
      paint(ctx, providerName(provider), pad, pad - 3, inner * 0.6, 17, uiFont(size === "small" ? 12 : 13, "semibold"), P.ink);
      const corner = provider.id === "codex" && size === "small" ? creditsText(provider, now) : (loadInfo.cached ? tr("кэш") : ageText(state.fetchedAt, now));
      paint(ctx, corner, pad + inner * 0.45, pad - 2, inner * 0.55, 15, uiFont(11, "medium"), P.ink, "right");
      const value = lead ? pct(lead, state, now) : "—", label = lead ? leftOf(lead, provider) : "";
      if (size === "small") {
        paint(ctx, value, pad - 1, 26, inner, 48, displayFont(46), numberInk);
        paint(ctx, label, pad, 72, inner, 15, uiFont(11, "semibold"), P.ink);
        verdictBlock(ctx, verdict, pad, 90, inner, 46, P, 20);
        if (verdict.fraction === null) paint(ctx, verdict.detail.split(" · ").pop(), pad, height - pad - 14, inner, 15, uiFont(11, "medium"), P.ink);
        else rangeBar(ctx, pad, height - pad - 6, inner, 6, verdict, P, false);
        const image = card.addImage(ctx.getImage()); image.imageSize = new Size(width, height);
        return card;
      }
      const left = Math.min(150, inner * 0.46), rx = pad + left + 8, rw = width - rx - pad, short = height < 160;
      paint(ctx, value, pad - 1, short ? 23 : 25, left + 6, short ? 52 : 60, displayFont(short ? 50 : 58), numberInk);
      paint(ctx, label, pad, short ? 75 : 84, left + 6, 15, uiFont(11, "semibold"), P.ink);
      const barY = short ? Math.min(99, height - 59) : 108;
      verdictBlock(ctx, verdict, rx, 26, rw, Math.min(66, barY - 32), P, barY < 106 ? 34 : 38);
      rangeBar(ctx, pad, barY, inner, 9, verdict, P);
      paint(ctx, verdict.detail, pad, barY + 13, inner, 15, uiFont(11, "medium"), P.ink);
      const others = provider.limits.filter(w => w !== lead), footerY = height - pad - 13;
      const tall = height >= 200, rowsTop = barY + 38, rowHeight = 19;
      const capacity = tall ? Math.max(0, Math.floor((footerY - 6 - rowsTop) / rowHeight)) : 0;
      others.slice(0, capacity).forEach((w, i) => {
        const y = rowsTop + i * rowHeight, nameW = Math.min(170, inner * 0.5), barX = pad + nameW + 8, barW = inner - nameW - 8 - 46;
        paint(ctx, nativeLimitLabel(w, provider), pad, y, nameW, 15, uiFont(11.5, "medium"), P.ink);
        const rest = remaining(w, state, now);
        pill(ctx, barX, y + 6, barW, 3, P.inkFaint);
        if (rest !== null) pill(ctx, barX, y + 6, Math.max(3, barW * rest / 100), 3, P.ink);
        paint(ctx, pct(w, state, now), barX + barW, y, 46, 15, uiFont(12, "bold"), P.ink, "right");
      });
      const parts = [];
      if (provider.id === "codex") parts.push(creditsText(provider, now));
      if (!tall) {
        // A short card lists the other limits in one line; tokens stay in the detail screen.
        const shown = others.slice(0, 2).map(w => nativeLimitLabel(w, provider) + " " + pct(w, state, now));
        parts.push(...shown);
        if (others.length > shown.length) parts.push("+" + (others.length - shown.length) + tr(" в подробностях"));
      } else {
        const hidden = others.length - Math.min(others.length, capacity);
        parts.push(tr("токенов сегодня") + ": " + compactNumber(tokenTotal(provider, 1, now, timeZone).value) + (stale(provider.tokens.state, now) ? "*" : ""));
        parts.push(tr("промптов") + ": " + compactNumber(activityTotal(provider, 1, now, timeZone).prompts));
        if (hidden > 0) parts.push("+" + hidden + tr(" в подробностях"));
      }
      paint(ctx, parts.join(" · "), pad, footerY, inner, 15, uiFont(11, "semibold"), P.ink);
      const image = card.addImage(ctx.getImage()); image.imageSize = new Size(width, height);
      return card;
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
      const P = packagePalette(), metrics = widgetMetrics(typeof Device.screenSize === "function" ? Device.screenSize().width : 390);
      if (family === "large" || family === "extraLarge") {
        widget.backgroundColor = P.ground; widget.setPadding(8, 8, 8, 8);
        const gap = 6, inner = metrics.width - 16, height = metrics.large - 16;
        const cardHeight = snapshot.providers.length > 1 ? (height - gap) / 2 : height;
        snapshot.providers.forEach((provider, i) => {
          if (i) widget.addSpacer(gap);
          packageCard(widget, provider, P, inner, cardHeight, now, snapshot.timeZone, "large", loadInfo);
        });
      } else if (family === "small") {
        widget.setPadding(0, 0, 0, 0);
        const card = packageCard(widget, p, P, metrics.small, metrics.small, now, snapshot.timeZone, "small", loadInfo);
        widget.backgroundColor = card.backgroundColor;
      } else {
        widget.setPadding(0, 0, 0, 0);
        const card = packageCard(widget, p, P, metrics.width, metrics.medium, now, snapshot.timeZone, "medium", loadInfo);
        widget.backgroundColor = card.backgroundColor;
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
            '<span class="reset">' + esc(widgetResetText(w, state, now, data.timeZone)) + '</span>' +
            (function () { const pace = forecastText(w, state, now, data.timeZone); return pace ? '<span class="reset' + (pace.warn ? ' warn' : '') + '">' + esc(pace.text) + '</span>' : ''; })() + '</button>';
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
        root.innerHTML = ("<header><div><h1>" + tr("Лимиты подписок") + "</h1></div><span class=\"sync-label\">") + (info.cached ? tr("Кэш") : 'iCloud') + '</span></header>' +
          ("<div class=\"overview-label\"><span></span><span>" + tr("Осталось") + "</span></div><div class=\"overview\">") + U.overviewHTML(data, now) + '</div>' +
          '<details id="analytics"' + (analyticsOpen ? ' open' : '') + ("><summary>" + tr("История и активность") + "<svg aria-hidden=\"true\" class=\"chevron\" viewBox=\"0 0 16 16\" width=\"14\" height=\"14\"><path d=\"M3.5 6l4.5 4.5L12.5 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></summary><div class=\"details-content\">") +
          ("<div class=\"filters\"><label class=\"sr-only\" for=\"provider\">" + tr("Сервис") + "</label><select id=\"provider\">") + data.providers.map(provider => '<option value="' + provider.id + '"' + (provider.id === p.id ? ' selected' : '') + '>' + e(U.providerName(provider)) + '</option>').join('') +
          '</select><div class="segmented">' + ['limits', 'tokens'].map(m => '<button data-metric="' + m + '" aria-pressed="' + (m === metric) + '">' + (m === 'limits' ? tr("Лимиты") : tr("Токены")) + '</button>').join('') + '</div></div>' +
          (metric === 'limits' && p.limits.length ? ("<label class=\"select-label\" for=\"window\">" + tr("Окно лимита") + "</label><select id=\"window\">") + p.limits.map(w => '<option value="' + e(w.id) + '"' + (w.id === limitID ? ' selected' : '') + '>' + e(U.limitLabel(w, p)) + '</option>').join('') + '</select>' : '') +
          '<div class="graph-label">' + (metric === 'limits' ? tr("Использовано · 0–100%") : tr("Токены по дням")) + '</div><div class="graph">' + graph + '</div><div class="ranges">' + ['24h', '7d', '30d'].map(r => '<button data-range="' + r + '" aria-pressed="' + (r === range) + '">' + (r === '24h' ? (metric === 'tokens' ? tr("Сегодня") : tr("24 часа")) : r === '7d' ? tr("7 дней") : tr("30 дней")) + '</button>').join('') + '</div>' +
          '<p class="note">' + (metric === 'limits' ? tr("Разрывы: сброс лимита или нет наблюдений.") : tr("Пропуски не означают нулевой расход.")) + '</p>' +
          ("<div class=\"token-summary\"><h3>" + tr("Токены · по данным этого Mac") + "</h3><div class=\"token-cards\">") + tokenCards + ("</div><p class=\"note\">" + tr("Обновлено ")) + e(U.ageText(p.tokens.state.fetchedAt, now)) + (U.stale(p.tokens.state, now) ? tr(" · данные могут быть устаревшими") : '') + '</p>' + tokenDetails + '</div>' + activityDetails + '</div></details>' +
          '<details id="connection"' + (connectionOpen ? ' open' : '') + ("><summary>" + tr("Синхронизация") + "<svg aria-hidden=\"true\" class=\"chevron\" viewBox=\"0 0 16 16\" width=\"14\" height=\"14\"><path d=\"M3.5 6l4.5 4.5L12.5 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></summary><div class=\"details-content\">") + statusRows +
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
      const helpers = { tr, sourceMessage, esc, validDate, finite, clamp, ageText, stale, limitState, resetDue, remaining, pct, resetCreditInfo, windowLabel, resetText, widgetResetText, forecastText, selectedLimits, displayLimits, displaySnapshot, providerName, limitLabel, nativeLimitLabel, overviewHTML, dayKey, tokenTotal, tokenBreakdown, activityTotal, compactNumber, historySegments, chartSVG };
      const declarations = Object.entries(helpers).map(([name, fn]) => 'const ' + name + '=' + fn.toString() + ';').join('\n');
      const safeJSON = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
      const css = `
        :root{--bg:#fff;--text:#222;--muted:#767676;--line:#ededed;--surface:#f6f6f6;--claude:#b0482a;--codex:#1c6a55;--accent:var(--codex);font-family:-apple-system,BlinkMacSystemFont,sans-serif;color-scheme:light dark}
        *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-size:13px;-webkit-font-smoothing:antialiased}#root{max-width:560px;margin:auto;padding:28px 22px max(30px,env(safe-area-inset-bottom))}header{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px}.app-name{font-size:11px;color:var(--muted)}h1{font-size:23px;letter-spacing:-.65px;font-weight:600;margin:7px 0 0}h2{font-size:14px;font-weight:600;margin:0;display:flex;align-items:center;gap:8px}h3{font-size:12px;font-weight:500;margin:0 0 13px}.sync-label{font-size:11px;color:var(--muted)}.overview-label{display:flex;justify-content:space-between;color:var(--muted);font-size:10px;margin-bottom:10px}.provider-section{border:1px solid var(--line);border-radius:12px;padding:17px 16px 2px;margin-bottom:14px}.provider-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}.mark{width:6px;height:6px;border-radius:50%;background:var(--accent)}.source-age{color:var(--muted);font-size:10px;white-space:nowrap}.source-note{font-size:11px;color:#a56a39;margin:10px 0 0;line-height:1.5}.unavailable{color:var(--muted);font-size:12px;margin:18px 0}
        button,select{font:inherit;color:inherit}button{cursor:pointer;-webkit-tap-highlight-color:transparent}button:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px}.quota-row{border:0;border-bottom:1px solid var(--line);background:transparent;width:100%;padding:14px 0 13px;text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px 14px;align-items:baseline}.quota-row:last-child{border-bottom:0}.quota-row:active{opacity:.65}.quota-label{font-size:12px;line-height:1.3;overflow-wrap:anywhere}.quota-row strong{font-size:19px;font-weight:500;letter-spacing:-.5px;font-variant-numeric:tabular-nums}.track{grid-column:1/-1;height:3px;background:var(--line);display:block;border-radius:2px;overflow:hidden}.track i{display:block;height:100%;background:var(--accent);border-radius:2px}.reset{grid-column:1/-1;color:var(--muted);font-size:10px;line-height:1.3}.reset.warn{justify-self:start;background:#ffb020;color:#1e1405;font-weight:600;border-radius:999px;padding:3px 9px;font-size:11px}
        .activity-strip{display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-size:10px;padding:12px 0}.activity-strip b{color:var(--accent);font-weight:600;margin-left:4px}.activity-table{border-collapse:collapse;width:100%;font-size:11px;font-variant-numeric:tabular-nums}.activity-table td,.activity-table th{padding:10px 3px;border-bottom:1px solid var(--line);text-align:right}.activity-table td:first-child,.activity-table th:first-child{text-align:left}.activity-table th{font-weight:400;color:var(--muted)}.token-breakdown{margin-top:22px}
        .reset-credits{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px 14px;padding:14px 0;font-size:12px}.reset-credits strong{font-size:20px;font-weight:600;color:var(--codex);font-variant-numeric:tabular-nums}.reset-credits small{grid-column:1/-1;color:var(--muted);font-size:10px;line-height:1.5}
        details{border-bottom:1px solid var(--line);scroll-margin-top:18px}summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;list-style:none;min-height:52px;font-size:12px;font-weight:500}summary::-webkit-details-marker{display:none}.chevron{color:var(--muted);width:14px;height:14px;min-height:0;flex:none;transition:transform .15s}details[open]>summary .chevron{transform:rotate(180deg)}.details-content{padding:4px 0 21px}.filters{display:flex;gap:12px;align-items:center;margin-bottom:14px}.filters>select{flex:1;width:40%}select{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:9px 8px;font-size:11px;min-width:0;width:100%;min-height:36px}.segmented,.ranges{display:flex;gap:2px}.segmented{border:1px solid var(--line);border-radius:6px;padding:2px}.segmented button,.ranges button{background:transparent;border:0;padding:8px 12px;border-radius:4px;font-size:11px;color:var(--muted);min-height:32px}button[aria-pressed=true]{background:var(--surface);color:var(--text)}.select-label{display:block;font-size:10px;color:var(--muted);margin:0 0 6px}.graph-label{font-size:10px;color:var(--muted);margin:19px 0 9px}.graph{color:var(--accent)}svg{width:100%;height:auto;display:block;min-height:95px}.ranges{justify-content:center;margin-top:10px}.note{color:var(--muted);font-size:10px;line-height:1.6;margin:13px 0 0}.empty{padding:30px 0;text-align:center;color:var(--muted);font-size:12px;line-height:1.6}.token-summary{margin-top:22px;padding-top:20px;border-top:1px solid var(--line)}.token-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.token-cards span{display:block;font-size:10px;color:var(--muted)}.token-cards b{display:block;font-size:20px;font-weight:500;letter-spacing:-.5px;margin:7px 0}.token-cards small{font-size:9px;color:var(--muted)}.connection-provider{padding:12px 0 18px;border-bottom:1px solid var(--line);margin-bottom:8px}.status-row{display:flex;justify-content:space-between;gap:16px;padding-top:11px;font-size:11px;line-height:1.5}.status-row span{color:var(--muted);flex-shrink:0}.status-row b{font-weight:400;text-align:right}.bars{height:120px;display:flex;align-items:end;gap:4px;border-bottom:1px solid var(--line)}.bars>div{flex:1;display:flex;justify-content:center;align-items:end;height:100%}.bars i{background:var(--accent);width:100%;max-width:40px;border-radius:2px 2px 0 0}.bars i.missing{background:var(--line)}.setup{border-top:1px solid var(--line);padding-top:20px}ol{padding-left:18px;line-height:1.7;color:var(--muted)}li{padding:5px 0}.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
        @media(prefers-color-scheme:dark){:root{--bg:#171717;--text:#eee;--muted:#999;--line:#303030;--surface:#282828;--claude:#e38463;--codex:#56b99a}.source-note{color:#c79b72}}
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
      // Notifications must never break the widget or the detail screen.
      try { await deliverNotifications(info.snapshot); } catch (_) {}
      Script.complete();
    }

    return { language, forLanguage, tr, sourceMessage, validateSnapshot, parseOptions, ageText, stale, limitState, resetDue, remaining, pct, windowLabel, resetText, widgetResetText,
      resetCreditInfo, readingTime, quotaCaptionLines, widgetFreshness, forecastText, bindingLimit, packageVerdict, widgetMetrics, plannedNotifications, deliverNotifications, selectedLimits, displayLimits, displaySnapshot, providerName, limitLabel, nativeLimitLabel, overviewHTML, dayKey, tokenTotal, tokenBreakdown, activityTotal, compactNumber, historySegments, chartSVG, createWidget, loadSnapshot, dashboardHTML, run };
  }
  return forLanguage("ru");
})();

module.exports = AIUsage;
