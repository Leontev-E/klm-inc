# KLM inc

`KLM inc` is a VS Code extension for automatic cleanup and normalization of `index.html`.

## What it does

- Adds the required PHP block to the first line if it is missing.
- Adds the required `domonetka` + `indexPxl.js` block right after `</title>` if it is missing.
- Detects common JS/CSS libraries and rewrites their links to canonical `cdnjs.cloudflare.com` URLs.
- Replaces suspicious or malformed external links (fake CDN domains, typo domains, etc.) with valid CDNJS links.
- If a recognized library is connected locally, it switches to CDNJS and removes the local library file from the workspace.
- Syncs `success.php` and `error.php` into the site root: creates them when missing and replaces them when present.
- Ensures `api.php` exists in the site root (creates an empty file if missing).

## Command

- `KLM inc: Process index.html`

Default keybinding:
- Windows/Linux: `Ctrl+Alt+Shift+P`

## Notes

- The extension processes `index.html` in the active editor, or the first `index.html` found in the workspace.
- Save your project in git before running, because local library files can be removed when migrated to CDNJS.

---

## Русская версия

`KLM inc` — расширение VS Code для автоматической очистки и нормализации `index.html`.

## Что делает расширение

- Добавляет обязательный PHP-блок в первую строку файла, если его нет.
- Добавляет блок `domonetka` + `indexPxl.js` сразу после `</title>`, если его нет.
- Находит подключения популярных JS/CSS библиотек и переводит их на канонические URL `cdnjs.cloudflare.com`.
- Заменяет подозрительные или некорректные внешние ссылки (фейковые CDN, домены с опечатками и т.д.) на валидные ссылки CDNJS.
- Если библиотека подключена локально, заменяет подключение на CDNJS и удаляет локальный файл библиотеки из workspace.
- Синхронизирует `success.php` и `error.php` в корне сайта: создаёт, если нет, и перезаписывает, если уже есть.
- Проверяет наличие `api.php` в корне сайта и создаёт пустой файл, если его нет.

## Команда

- `KLM inc: Process index.html`

Горячая клавиша по умолчанию:
- Windows/Linux: `Ctrl+Alt+Shift+P`

## Примечания

- Расширение обрабатывает `index.html` в активном редакторе или первый найденный `index.html` в workspace.
- Перед запуском рекомендуется сохранить проект в git, так как локальные файлы библиотек могут быть удалены при миграции на CDNJS.
