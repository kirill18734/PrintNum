# <img src="./public/favicon.ico" width="50em">PrintNum — Печать ячеек (Ozon)

Windows-приложение для автоматической печати номеров ячеек на складе Ozon. Интегрируется с сайтом Ozon через браузерное расширение, позволяя ускорить процессы выдачи заказов, возвратов и упаковки.

## 📋 Содержание

- [PrintNum — Печать ячеек Ozon](#printnum--печать-ячеек-ozon)
- [🚀 Быстрый старт](#-быстрый-старт)
- [Стек технологий](#стек-технологий)
- [Архитектура](#архитектура)
- [Внешний вид](#внешний-вид)
- [Требования](#требования)
- [Возможности](#возможности)
- [API документация](#api-документация)
- [Разработка](#разработка)
- [Сборка и установка](#сборка-и-установка)
- [Структура проекта](#структура-проекта)
- [Лицензия](#лицензия)
- [Авторы](#авторы)

## 🚀 Быстрый старт

1. **Скачайте MSI-установщик**: Перейдите в раздел [Releases](https://github.com/kirill18734/PrintNum/releases) и скачайте последний доступный инсталлятор.
2. **Установите приложение**: Запустите MSI и следуйте инструкциям.
3. **Запустите PrintNum**: Откройте приложение из меню "Пуск" или ярлыка на рабочем столе.
4. **Настройте параметры**:
   - **Принтер**: выберите доступный принтер Windows.
   - **Размер этикетки**: задайте ширину и высоту.
   - **Стиль этикетки**: настройте формат текста и расположение.
5. **Установите расширение** (см. [подробности](https://github.com/kirill18734/PrintNum/tree/main/extension)):
   - Откройте `chrome://extensions/` в браузере (Yandex, Chrome).
   - Включите "Режим разработчика".
   - Найдите папку, в которой находится основной `.exe` файл программы, и скопируйте путь к этой папке.
     (см. [Как открыть расположение исполняемого EXE файла программы в Windows](https://remontka.pro/open-exe-file-location-windows)).
   - Внутри этой же директории находится папка `extension` — именно её нужно выбрать для установки.
   - Нажмите "Загрузить распакованное расширение"
   - Выберите папку `extension`.
6. **Перезагрузите страницы Ozon**.
7. **Готово**: расширение начнёт отправлять номера ячеек на локальный backend PrintNum.

## Стек технологий

| Компонент     | Технология                                                                                                                               | Описание                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Frontend**  | [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/) 5.8 + [Tailwind CSS](https://tailwindcss.com/) 4.3 + Vite | UI приложения                 |
| **Backend**   | [Python](https://www.python.org/) 3.10+ + [Flask](https://flask.palletsprojects.com/) 3.1 + [pywin32](https://github.com/pywin/pywin32)  | API для печати и конфигурации |
| **Desktop**   | [Tauri](https://tauri.app/) 2 (Rust 2021)                                                                                                | Десктопная оболочка Windows   |
| **Extension** | [WXT](https://wxt.dev/) + React 18 + TypeScript                                                                                          | Браузерное расширение Ozon    |

## Архитектура

Проект использует модульную архитектуру для разделения ответственности между четырьмя основными компонентами:

### 🎨 **Frontend (React)**

- Управляет пользовательским интерфейсом и настройками приложения.
- Коммуницирует с backend через HTTP-запросы.
- Отвечает за темы, стили этикеток и сохранение конфигурации.

### 🔧 **Backend (Flask + Python)**

- Запускает REST API сервер для обработки запросов на печать.
- Загружает и сохраняет конфигурацию.
- Проверяет состояние принтера и отправляет текст на печать.
- Завершается автоматически после 15 секунд неактивности.

### 📱 **Desktop (Tauri + Rust)**

- Обеспечивает нативную оболочку приложения для Windows.
- Запускает backend-процесс при старте.
- Поддерживает автообновления и системные диалоги.

### 🌐 **Браузерное расширение (WXT + React + TypeScript)**

- Работает на страницах Ozon и отправляет номера ячеек на локальный backend.
- Автоматизирует процессы выдачи, приемки и возвратов.
- Скрывает элементы интерфейса и управляет поведением страницы.

```
Пользователь                    Ozon сайт
   ↓                               ↓
 Desktop UI ────────────→ Расширение
   ↓                               ↓
 React-Router                 Content Scripts
   ↓                               ↓
[API Client] ←──────────────[fetch request]
   ↓                               ↓
 Flask Backend
   ↓
[Windows API - Принтер]
   ↓
  📄 Печать этикетки
```

## Внешний вид

[(Вернуться к началу)](#printnum--печать-ячеек-ozon)

<table>
  <thead>
    <tr>
      <th>Светлая тема</th>
      <th>Тёмная тема</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2" style="font-weight: bold; text-align: center;">Главная страница</td>
    </tr>
    <tr>
      <td><img src="./public/light/home.png" alt="Главная — светлая" /></td>
      <td><img src="./public/dark/home.png" alt="Главная — тёмная" /></td>
    </tr>
    <tr>
      <td colspan="2" style="font-weight: bold; text-align: center;">Настройки</td>
    </tr>
    <tr>
      <td><img src="./public/light/settings.png" alt="Настройки — светлая" /></td>
      <td><img src="./public/dark/settings.png" alt="Настройки — тёмная" /></td>
    </tr>
  </tbody>
</table>

## Требования

[(Вернуться к началу)](#printnum--печать-ячеек-ozon)

- **ОС**: Windows 8+ x64 — требуется для работы печати и Tauri.
- **Браузер**: Chromium-совместимый браузер (Chrome, Yandex, Edge).
- **Python**: 3.10+ для backend-разработки.
- **Node.js**: 18+ LTS для frontend, extension и Tauri.
- **Rust**: 1.70+ для сборки Tauri-приложения.
- **Python-зависимости**: Flask, flask-cors, pywin32.

## Возможности

[(Вернуться к началу)](#printnum--печать-ячеек-ozon)

### Возможности приложения

- 🖨️ **Выбор принтера**: Детектирует локальные Windows-принтеры.
- 📏 **Настройка этикетки**: Задаёт ширину, высоту и формат текста.
- 🔤 **Форматирование текста**: Рокировка (swap) текстов, включение/отключение ID, гибридный режим.
- 🌙 **Темы оформления**: Поддержка светлой и тёмной темы.
- 🎨 **Пользовательские параметры**: Управление внешним видом и шаблонами печати.
- 🔄 **Автообновления**: Механизм обновления через Tauri.
- 💾 **Сохранение конфигурации**: Все параметры сохраняются и восстанавливаются при запуске.

### Возможности расширения

см. [Документация расширения](https://github.com/kirill18734/PrintNum/tree/main/extension)

## API документация

Backend предоставляет REST API на Flask на порту `5000`.

| Метод    | Эндпоинт          | Описание                     | Ответ                           |
| -------- | ----------------- | ---------------------------- | ------------------------------- |
| **GET**  | `/`               | Проверка доступности сервера | `{"status": true}`              |
| **GET**  | `/status-printer` | Проверка состояния принтера  | `{"printerOnline": true/false}` |
| **POST** | `/print-number`   | Печать номера ячейки         | `OK`                            |

**Базовый URL**: `http://127.0.0.1:5000`

**Автозавершение**: сервер автоматически завершается через 15 секунд неактивности (watchdog).

## Разработка

[(Вернуться к началу)](#printnum--печать-ячеек-ozon)

1. **Клонируйте репозиторий**:

   ```bash
   git clone https://github.com/kirill18734/PrintNum.git
   cd PrintNum
   ```

2. **Настройте backend**:
   - Установите Python 3.10+ с [python.org](https://www.python.org/) (добавьте в PATH).
   - Перейдите в папку `backend`:
     ```bash
     cd backend
     ```
   - Создайте виртуальное окружение:
     ```bash
     python -m venv .venv
     .venv\Scripts\activate  # Windows
     ```
   - Установите зависимости:
     ```bash
     pip install -r requirements.txt
     ```
   - Запустите сервер:
     ```bash
     python backend.py
     ```
   - Сервер запустится на `http://localhost:5000`

3. **Настройте frontend** (в корне проекта):
   - Убедитесь, что Node.js 18+ установлен.
   - Установите зависимости:
     ```bash
     npm install
     ```
   - Запустите dev-сервер Vite:
     ```bash
     npm run dev
     ```
   - Frontend откроется на `http://localhost:5173`

4. **Запустите Tauri** (нативное приложение):
   - Установите prerequisites для вашей ОС: [tauri.app/start/prerequisites](https://tauri.app/start/prerequisites/)
   - В корне проекта запустите:
     ```bash
     npm run tauri dev
     ```
   - Откроется окно приложения с HMR (hot-reload)

5. **Тестируйте расширение**:
   см. [Документация расширения](https://github.com/kirill18734/PrintNum/tree/main/extension)

## Сборка и установка

[(Вернуться к началу)](#printnum--печать-ячеек-ozon)

- **Backend в EXE**: Используйте [auto-py-to-exe](https://github.com/brentyi/auto-py-to-exe):
  1. Откройте auto-py-to-exe в папке `backend/`
  2. Выберите `backend.py` как основной скрипт
  3. Добавьте как "Additional files": `data.py`, `print_text.py`, `utils.py`
  4. Установите опции: One File, Console Window Disabled
  5. Build → готовый EXE будет в `backend/output/backend/`
- **Полная сборка приложения**:

  ```bash
  npm run build       # Сборка frontend
  npm run tauri build # Сборка Tauri (создаст MSI)
  ```

  MSI-инсталлятор будет в `src-tauri/target/release/bundle/nsis/`

- **Установка через MSI**: Запустите `.msi` файл. Приложение установится с расширением и backend'ом.

## Структура проекта

```
PrintNum/
├── app/                          # React-Router приложение
│   ├── root.tsx                  # Главный Layout с темами
│   ├── routes.ts                 # Конфигурация маршрутов
│   ├── assets/
│   │   └── App.tsx               # Главный компонент
│   ├── components/               # React компоненты
│   │   ├── ui/                   # UI компоненты (button, input, select и т.д.)
│   │   ├── theme.tsx             # Провайдер тем
│   │   └── theme-style.tsx       # Провайдер стилей этикеток
│   ├── config/                   # Конфигурация
│   │   └── theme-style.ts        # Стили этикеток по умолчанию
│   ├── routes/                   # Страницы приложения
│   │   ├── home.tsx              # Главная страница
│   │   ├── layout.tsx            # Layout с навигацией
│   │   ├── settings/             # Страница настроек
│   │   └── action.*.tsx          # Обработчики действий
│   ├── services/                 # Сервисы
│   │   ├── api.ts                # HTTP клиент для Flask
│   │   └── updater.ts            # Проверка обновлений
│   ├── lib/                      # Утилиты
│   │   └── utils.ts              # Общие функции
│   └── styles/                   # CSS
│       ├── globals.css           # Глобальные стили
│       ├── theme.css             # Стили тем
│       └── themes/               # 13+ CSS тем (claude.css, cyberpunk.css и т.д.)
│
├── backend/                      # Python Flask сервер (печать)
│   ├── backend.py                # Основной Flask сервер
│   ├── data.py                   # Управление конфиг-файлом (JSON)
│   ├── print_text.py             # Логика печати этикеток
│   ├── utils.py                  # Утилиты (список принтеров, проверка статуса)
│   ├── requirements.txt          # Зависимости Python
│   ├── *.http                    # Примеры HTTP запросов
│   └── output/                   # Скомпилированные EXE (auto-py-to-exe)
│
├── extension/                    # Браузерное расширение на WXT
│   ├── src/                      # Исходный код расширения
│   │   ├── entrypoints/          # Content scripts и background
│   │   ├── popup/                # Интерфейс popup
│   │   ├── components/           # UI компоненты
│   │   ├── hooks/                # Пользовательские хуки
│   │   ├── lib/                  # Вспомогательные утилиты
│   │   ├── utils/                # Логика расширения
│   │   └── assets/               # Стили и ресурсы
│   ├── package.json              # Зависимости расширения
│   ├── tsconfig.json             # Конфиг TypeScript
│   ├── wxt.config.ts             # Конфиг WXT
│   ├── tailwind.config.js        # Tailwind конфиг
│   └── postcss.config.js         # PostCSS конфиг
│
├── src-tauri/                    # Tauri конфигурация и Rust код
│   ├── Cargo.toml                # Конфиг Rust проекта
│   ├── tauri.conf.json           # Конфигурация Tauri приложения
│   ├── build.rs                  # Скрипт сборки
│   ├── src/
│   │   ├── main.rs               # Точка входа приложения
│   │   └── lib.rs                # Rust библиотека
│   ├── capabilities/             # Permissions для Tauri (default.json, desktop.json)
│   ├── gen/schemas/              # Автогенерируемые schemas
│   ├── icons/                    # Иконки приложения
│   └── target/                   # Скомпилированные бинарники
│
├── public/                       # Статические ресурсы
│   ├── icon.ico                  # Основная иконка
│   ├── light/ & dark/            # Скриншоты тем
│   └── ...                       # Другие ассеты
│
├── tsconfig.json                 # Конфиг TypeScript
├── vite.config.ts                # Конфиг Vite сборщика
├── react-router.config.ts        # Конфиг React-Router
├── package.json                  # Зависимости Node.js
├── README.md                     # Документация
├── latest.json                   # Информация о последнем релизе (для updater)
├── privateKey.txt                # Закрытый ключ для подписи обновлений
└── .venv/                        # Виртуальное окружение Python (после setup)
```

## Лицензия

Этот проект распространяется под лицензией MIT. См. [LICENSE](LICENSE) для деталей.

## Авторы

[(Вернуться к началу)](#printnum--печать-ячеек-ozon)

- **Кирилл** — Разработчик. [Telegram](https://web.telegram.org/k/#@ASPIRhigher)

Если у вас есть вопросы или предложения, создайте Issue в репозитории!
