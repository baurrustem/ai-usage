# AI Usage

Лимиты подписок Claude Code и Codex на iPhone, токены и активность по журналам вашего Mac.

**Mac → iCloud Drive → Scriptable.** Отдельный сервер и Apple Developer Program не нужны. Можно подключить один сервис или оба. Виджеты и экран подробностей доступны на английском и русском. При новой установке выбран английский. [English documentation](README.md).

Это первая публичная версия. Виджет использовался на настоящем iPhone, но все размеры устройств и версии iOS пока не проверены. Проект независим от Anthropic, OpenAI, Apple и Scriptable.

## Возможности

- Общие лимиты аккаунта, остаток в процентах, время сброса и история.
- Все группы, которые возвращает источник. В небольших виджетах помещается часть строк, полный список — в подробностях.
- Количество доступных сбросов Codex, если установленный app-server возвращает это поле. Сбросы не применяются.
- Токены за сегодня / 7 / 30 дней, промпты, уникальные сессии и активные дни **по данным этого Mac**.
- Светлая/тёмная тема, домашний экран и экран блокировки, отметки ошибок и устаревания.

Токены включают кэш; это не сумма к оплате и не лимит токенов подписки. Проценты лимитов не переводятся в токены. Mac собирает данные каждые 5 минут, пока работает. Обновление виджета запрашивается через 15 минут, фактическое расписание определяет iOS.

## Установка

Нужны macOS (Apple Silicon или Intel), **Python 3.12+**, iPhone со [Scriptable](https://scriptable.app/) и общий Apple Account с iCloud Drive. Claude Code и/или Codex должны быть установлены и авторизованы. Node.js нужен только разработчикам для тестов и предпросмотра; Python-пакеты устанавливать не требуется.

1. Установите и откройте Scriptable на iPhone, включите для него iCloud Drive.
2. Скачайте ZIP исходников или релиза, распакуйте и откройте Терминал в этой папке.
3. Запустите подходящую команду:

   ```bash
   bash install.command --providers claude,codex --language ru
   # Только одна подписка:
   # bash install.command --providers claude
   # bash install.command --providers codex
   ```

   Часовой пояс определяется на Mac, при невозможности — UTC. Его можно задать сразу:

   ```bash
   bash install.command --providers claude,codex --time-zone Asia/Almaty
   ```

4. Проверьте результат:

   ```bash
   "$HOME/Library/Application Support/AI Usage/bin/ai-usage" doctor
   ```

5. Дождитесь **AI Usage** в Scriptable на iPhone и запустите его. Добавьте виджет Scriptable, выберите **AI Usage**, действие **Run Script**. Параметр `claude` или `codex` выбирает сервис для маленького виджета и открытия подробностей. Если подключён один сервис, выбирается он.
6. Для экрана блокировки добавьте Scriptable через редактор экрана блокировки и выберите тот же скрипт.

Установщик скачивает CodexBar CLI **0.56.7** и проверяет SHA-256. Сборщик помещается в `~/Library/Application Support/AI Usage`, автозапуск — в `~/Library/LaunchAgents/local.ai-usage.collector.plist`. В настоящую папку Scriptable передаются `AI Usage.js` и `AI Usage/snapshot.json`. Если iCloud ещё не готов, локальный сбор продолжается. Один пользователь macOS — один сборщик.

Вход выполняется через инструменты самих провайдеров. Ключи, пароли и cookies в AI Usage передавать не нужно. Claude читается через служебную CLI-сессию CodexBar `/usage`; совместимость этого стороннего механизма с обновлениями Claude не гарантирована. В Codex используется `account/rateLimits/read`. Установщик не обновляет эти приложения.

## Настройка

Язык интерфейса можно изменить на Mac:

```bash
"$HOME/Library/Application Support/AI Usage/bin/ai-usage" configure --language en
# Вернуть русский: configure --language ru
```

Настройка применяется при следующем сборе. Для одного виджета задайте `codex;lang=en` или `claude;lang=ru` в поле Parameter; подробности откроются на том же языке. Старые настройки и снимки без поля языка сохраняют русский.


При новой установке видны все полученные лимиты, включая Sonnet и Spark. Fable не добавляется без настройки или данных источника.

```bash
"$HOME/Library/Application Support/AI Usage/bin/ai-usage" configure --providers codex
"$HOME/Library/Application Support/AI Usage/bin/ai-usage" configure --hide-limit codex:spark
"$HOME/Library/Application Support/AI Usage/bin/ai-usage" configure --show-all-limits
```

[Настройки и примеры](docs/configuration.md): часовой пояс, пути CLI, папка iCloud, фильтры, закреплённые лимиты. Изменения применяются в следующем цикле. Для нового чтения выполните `collect`. Не редактируйте синхронизируемый скрипт вручную: сборщик заменяет его своей версией.

## Обновление, диагностика и удаление

Для обновления распакуйте новую версию и повторите `bash install.command`. История и настройки сохраняются. Автоматического обновления кода нет. Папку исходников после установки можно удалить, используемый Python — сохранить.

```bash
"$HOME/Library/Application Support/AI Usage/bin/ai-usage" collect
"$HOME/Library/Application Support/AI Usage/bin/ai-usage" sync
"$HOME/Library/Application Support/AI Usage/bin/ai-usage" doctor --share
"$HOME/Library/Application Support/AI Usage/bin/ai-usage" uninstall
```

`sync` повторяет передачу без запросов к сервисам. `doctor --share` убирает локальные пути и часовой пояс из диагностики. Проверьте вывод перед публикацией в issue.

Удаление убирает программы и автозапуск, но сохраняет локальную историю и файлы iCloud. При необходимости удалите оставшуюся папку данных и только файлы AI Usage из Scriptable вручную. [Решение проблем](docs/troubleshooting.md).

## Данные и ограничения

В облако уходят лимиты, дневные счётчики и хэши сессий. Тексты промптов, пути проектов, исходные ID сессий и авторизация остаются на Mac. Снимки, история и реальные скриншоты всё равно содержат личную статистику — не прикладывайте их к публичным issue. Подробнее: [архитектура и приватность](docs/architecture.md).

История хранится локально 90 дней, на телефон передаются последние 30. Полные токены Claude Max со всех устройств не заявляются. Другие API, стоимость, уведомления, несколько аккаунтов/Mac пока не поддерживаются.

## Разработка

```bash
make test
make preview
make check-public
make dist
```

Предпросмотр по умолчанию использует вымышленные данные. Реальные доступны только с явным `--live` или `--snapshot PATH`. Они не включаются в релиз. [Участие в разработке](CONTRIBUTING.md), [подготовка релиза](docs/releasing.md).

Код распространяется по [MIT](LICENSE). [Зависимости и их лицензии](THIRD_PARTY_NOTICES.md).
