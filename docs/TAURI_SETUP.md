# Развёртывание и сборка PrintNum (Tauri)

Это руководство описывает полный процесс подготовки окружения, запуска и сборки **десктопной части PrintNum на Tauri 2** в Windows: frontend на React/Vite, Rust-оболочку Tauri, ресурсы приложения и установщик.

Инструкция рассчитана на разработчика, который разворачивает проект из исходного кода на чистой машине.

> **Граница документации:** сборка и настройка Python-backend здесь не описываются. Для этого используйте отдельное [руководство по Backend](../backend/README.md). Backend подключается к Tauri как внешний исполняемый файл (sidecar), поэтому его нужно подготовить до запуска приложения и сборки установщика.

## Содержание

- [Что входит в проект](#что-входит-в-проект)
- [Требования к окружению](#требования-к-окружению)
- [Установка инструментов](#установка-инструментов)
- [Получение исходного кода](#получение-исходного-кода)
- [Подготовка Backend](#подготовка-backend)
- [Установка зависимостей frontend](#установка-зависимостей-frontend)
- [Запуск в режиме разработки](#запуск-в-режиме-разработки)
- [Сборка приложения](#сборка-приложения)
- [Ресурсы приложения](#ресурсы-приложения)
- [Браузерное расширение](#браузерное-расширение)
- [Подпись обновлений](#подпись-обновлений)
- [Диагностика](#диагностика)

## Что входит в проект

Десктопная часть PrintNum состоит из нескольких частей:

- **Frontend** — интерфейс на React и TypeScript. Vite используется для локального сервера разработки и production-сборки.
- **Tauri 2** — оболочка приложения и нативная часть на Rust. Её конфигурация находится в `src-tauri/tauri.conf.json`.
- **Ресурсы** — встроенные изображения фонов и шрифты из каталога `resources/`. Они добавляются в пакет приложения.
- **Backend** — отдельный локальный Python-сервис. Он не собирается командами frontend/Tauri и подготавливается отдельно по [руководству Backend](../backend/README.md).
- **Браузерное расширение** — отдельный компонент для Chromium-браузеров. Оно не встраивается в Tauri-установщик.

Основные команды проекта находятся в корневом `package.json`:

- `npm run dev` — запускает только frontend-сервер Vite.
- `npm run build` — проверяет TypeScript и собирает frontend в `dist/`.
- `npm run tauri dev` — запускает полноценное desktop-приложение Tauri в режиме разработки.
- `npm run tauri build` — собирает production-приложение и установщик.

## Требования к окружению

Для текущей конфигурации проекта используйте **Windows 10/11 x64**.

| Компонент | Для чего нужен |
| --- | --- |
| Git | Получение исходного кода |
| Node.js и npm | Установка зависимостей и сборка React/Vite |
| Rust и Cargo | Компиляция нативной части Tauri |
| Microsoft C++ Build Tools | Компилятор и linker для Rust MSVC |
| Microsoft Edge WebView2 Runtime | Отображение интерфейса приложения в Windows |
| Подготовленный Backend sidecar | Запуск локального сервиса из приложения и включение его в установщик |

Для Node.js рекомендуется актуальная LTS-версия, совместимая с Vite 7. Для Rust используйте стабильный toolchain MSVC x64.

Официальная инструкция Tauri по системным требованиям: [Prerequisites](https://v2.tauri.app/start/prerequisites/).

## Установка инструментов

### 1. Git

Установите Git для Windows: [git-scm.com](https://git-scm.com/download/win).

Проверьте установку в PowerShell:

```powershell
git --version
```

### 2. Node.js и npm

Установите Node.js LTS с официального сайта: [nodejs.org](https://nodejs.org/). npm устанавливается вместе с Node.js.

Проверьте версии:

```powershell
node --version
npm --version
```

### 3. Microsoft C++ Build Tools

Скачайте [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/).

В установщике выберите рабочую нагрузку **«Разработка классических приложений на C++» (Desktop development with C++)**. Она необходима для компиляции Rust-кода под Windows MSVC.

Полная Visual Studio IDE не обязательна — достаточно Build Tools с указанной рабочей нагрузкой.

### 4. WebView2

Tauri использует Microsoft Edge WebView2 для отображения интерфейса. На актуальных версиях Windows Runtime обычно уже установлен. Если его нет, установите Evergreen Runtime со страницы [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/).

### 5. Rust

Установите Rust через [rustup](https://www.rust-lang.org/tools/install). Для текущей сборки Windows нужен MSVC toolchain.

После установки откройте новое окно PowerShell и выполните:

```powershell
rustup default stable-x86_64-pc-windows-msvc
rustc --version
cargo --version
```

Если команда установки toolchain сообщает, что он уже установлен, повторно устанавливать его не требуется.

## Получение исходного кода

Клонируйте репозиторий и перейдите в корневую папку проекта:

```powershell
git clone https://github.com/kirill18734/PrintNum.git
cd PrintNum
```

Все команды npm и Tauri из этого руководства выполняются именно из корня репозитория — там, где находится `package.json`.

## Подготовка Backend

До запуска desktop-приложения подготовьте Backend по отдельной инструкции:

**[Перейти к руководству по развёртыванию Backend](../backend/README.md).**

Это обязательный отдельный этап, а не часть сборки frontend или Rust-приложения. Не нужно устанавливать Python-зависимости в корневое Node.js-окружение: Backend имеет собственное окружение и процесс сборки.

### Где Tauri ожидает исполняемый файл

В текущем `src-tauri/tauri.conf.json` указан внешний бинарный файл:

```json
"externalBin": ["../backend/output/backend"]
```

Путь задаётся относительно каталога `src-tauri`. Для Windows x64 Tauri ожидает sidecar с суффиксом целевой платформы:

```text
backend/output/backend-x86_64-pc-windows-msvc.exe
```

Проверить используемый Rust target можно командой:

```powershell
rustc --print host-tuple
```

Имя и расположение sidecar должны соответствовать `externalBin` и правилам Tauri. Если бинарного файла нет или он назван иначе, запуск приложения либо упаковка могут завершиться ошибкой.

Подробнее о механизме sidecar: [Embedding External Binaries — Tauri](https://v2.tauri.app/develop/sidecar/).

## Установка зависимостей frontend

В корне проекта выполните:

```powershell
npm ci
```

Используйте именно `npm ci`, чтобы установить зависимости по зафиксированному `package-lock.json`. Команда не должна запускаться из папок `backend`, `extension` или `src-tauri`.

Если зависимости нужно установить заново после удаления `node_modules`, повторите `npm ci`.

## Запуск в режиме разработки

После установки инструментов, зависимостей frontend и подготовки Backend выполните из корня репозитория:

```powershell
npm run tauri dev
```

Tauri автоматически:

1. Запустит frontend-команду `npm run dev`, заданную в `src-tauri/tauri.conf.json`.
2. Поднимет локальный Vite-сервер на `http://localhost:1420`.
3. Соберёт и запустит Rust-часть приложения в режиме разработки.
4. Откроет окно PrintNum с frontend внутри WebView2.

При первом запуске Rust скачает и скомпилирует необходимые crates. Это может занять некоторое время. При последующих запусках большая часть зависимостей будет взята из локального кеша.

### Полезные команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Только frontend в браузерном dev-сервере |
| `npm run build` | Проверка TypeScript и production-сборка frontend |
| `npm run tauri dev` | Полный запуск desktop-приложения |
| `npm run tauri build` | Production-сборка Tauri и установщика |

Для разработки самого приложения обычно используйте `npm run tauri dev`, а не только `npm run dev`: браузерный запуск не предоставляет полноценное окружение Tauri и его нативные API.

## Сборка приложения

Перед сборкой убедитесь, что:

- зависимости frontend установлены через `npm ci`;
- Rust и C++ Build Tools установлены и доступны в терминале;
- WebView2 установлен;
- Backend sidecar подготовлен и находится по ожидаемому пути;
- необходимые ресурсы присутствуют в `resources/`.

Запустите production-сборку:

```powershell
npm run tauri build
```

Конфигурация Tauri сама запускает команды:

1. `npm run build` — проверка TypeScript и сборка frontend в `dist/`.
2. Компиляция Rust-приложения в release-режиме.
3. Подключение внешнего Backend sidecar.
4. Добавление ресурсов, указанных в `tauri.conf.json`.
5. Создание установщика.

В текущей конфигурации `bundle.targets` имеет значение `nsis`, поэтому основной установочный пакет Windows создаётся в формате NSIS.

Результаты сборки ищите в:

```text
src-tauri/target/release/bundle/nsis/
```

Исполняемые файлы и промежуточные результаты Rust находятся в `src-tauri/target/release/`. Каталоги `dist/` и `src-tauri/target/` являются генерируемыми: вручную редактировать их не нужно.

## Ресурсы приложения

В конфигурации Tauri подключены каталоги:

- `resources/backgrounds/` — встроенные фоновые изображения.
- `resources/fonts/` — встроенные шрифты.

При сборке эти каталоги добавляются в пакет приложения как ресурсы. Во время запуска Rust-часть подготавливает пользовательские каталоги в AppData и копирует туда отсутствующие встроенные файлы. Уже существующие пользовательские файлы не перезаписываются.

Не помещайте пользовательские данные и изменяемые файлы в `src-tauri/target/` или `dist/`: это каталоги сборки, они могут быть удалены при следующей компиляции.

## Браузерное расширение

Расширение — отдельный компонент и не включается в Tauri-установщик.

Для обычного использования установите опубликованную версию из [Chrome Web Store](https://chromewebstore.google.com/detail/printnum-%D0%BF%D0%B5%D1%87%D0%B0%D1%82%D1%8C-%D1%8F%D1%87%D0%B5%D0%B5%D0%BA-ozo/pebpcdibpeodhdkbeniijidffpfpiagn).

Если требуется развернуть или проверить расширение из исходников, используйте отдельную [инструкцию по Extension](../extension/README.md). Она описывает локальную установку распакованного расширения и режимы PROD/DEV.

## Подпись обновлений

В проекте включено создание артефактов обновления через `bundle.createUpdaterArtifacts`, а в конфигурации Tauri задан публичный ключ. Для создания подписанных updater-артефактов необходим соответствующий **закрытый ключ**.

В корне репозитория предусмотрен файл `.env` с переменными `TAURI_SIGNING_PRIVATE_KEY` и `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Для быстрой локальной сборки загрузите эти значения в окружение текущего окна PowerShell и запустите Tauri:

```powershell
if (-not (Test-Path .env)) {
    throw "Файл .env не найден в корне проекта"
}

Get-Content .env | ForEach-Object {
    $line = $_.Trim()

    if ($line.StartsWith("TAURI_SIGNING_PRIVATE_KEY=")) {
        $value = $line.Substring("TAURI_SIGNING_PRIVATE_KEY=".Length).Trim().Trim('"').Trim("'")
        $env:TAURI_SIGNING_PRIVATE_KEY = $value
    }
    elseif ($line.StartsWith("TAURI_SIGNING_PRIVATE_KEY_PASSWORD=")) {
        $value = $line.Substring("TAURI_SIGNING_PRIVATE_KEY_PASSWORD=".Length).Trim().Trim('"').Trim("'")
        $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = $value
    }
}

if (-not $env:TAURI_SIGNING_PRIVATE_KEY) {
    throw "В .env не задан TAURI_SIGNING_PRIVATE_KEY"
}

npm run tauri build
```

Команда читает только две переменные подписи и не выводит их значения в консоль. Запускайте её из корня репозитория. Переменные будут доступны процессу сборки и дочерним процессам в этом окне PowerShell; после его закрытия они исчезнут.

Используйте существующий закрытый ключ, соответствующий публичному ключу в `src-tauri/tauri.conf.json`. Не генерируйте новый ключ для публикации обновлений уже установленным пользователям: новые подписи не будут соответствовать ключу, которому доверяет их приложение.

**Безопасность:** файл `.env` с реальными секретами не должен попадать в Git, коммиты, публичные логи или установщик. Он добавлен в корневой `.gitignore`, чтобы Git не предлагал добавлять его в новые коммиты. Если файл уже был закоммичен ранее, одного `.gitignore` недостаточно — его нужно отдельно исключить из индекса Git и при необходимости сменить опубликованные секреты. Официальная документация: [Tauri Updater — Signing updates](https://v2.tauri.app/plugin/updater/).

## Диагностика

### `npm` или `node` не найдены

Проверьте установку Node.js и откройте новое окно PowerShell. Убедитесь, что команды `node --version` и `npm --version` возвращают версии.

### Ошибка компиляции Rust или `link.exe` не найден

Проверьте, что установлен Rust toolchain `stable-x86_64-pc-windows-msvc` и рабочая нагрузка **Desktop development with C++** в Visual Studio Build Tools. После установки перезапустите терминал.

### Не найден Backend sidecar

Проверьте, что подготовленный Backend находится по пути `backend/output/backend-x86_64-pc-windows-msvc.exe`. Также проверьте результат команды `rustc --print host-tuple` и соответствие суффикса целевой платформы.

### Не запускается окно приложения или отсутствует WebView

Проверьте наличие Microsoft Edge WebView2 Runtime. При необходимости установите Evergreen Runtime с официального сайта Microsoft.

### Порт 1420 занят

Vite настроен на фиксированный порт `1420` и не переключается автоматически на другой. Освободите порт или завершите другой процесс разработки, который его использует.

### Сборка updater-артефактов завершается ошибкой подписи

Проверьте, что переменная `TAURI_SIGNING_PRIVATE_KEY` указывает на существующий закрытый ключ проекта, а при необходимости задана правильная переменная `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Не заменяйте публичный ключ в конфигурации случайно сгенерированным ключом.

---

## Полезные ссылки

- [Официальная документация Tauri 2](https://v2.tauri.app/)
- [Системные требования Tauri для Windows](https://v2.tauri.app/start/prerequisites/)
- [Разработка приложения Tauri](https://v2.tauri.app/develop/)
- [Подключение внешних бинарных файлов (sidecar)](https://v2.tauri.app/develop/sidecar/)
- [Плагин обновлений Tauri](https://v2.tauri.app/plugin/updater/)
- [Документация Backend PrintNum](../backend/README.md)
- [Документация Extension PrintNum](../extension/README.md)
) {
        $name = $Matches[1]
        $value = $Matches[2].Trim()

        if ($value.Length -ge 2 -and
            (($value.StartsWith('"') -and $value.EndsWith('"')) -or
             ($value.StartsWith("'") -and $value.EndsWith("'")))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

if (-not $env:TAURI_SIGNING_PRIVATE_KEY) {
    throw "В .env не задан TAURI_SIGNING_PRIVATE_KEY"
}

npm run tauri build
```

Команда читает только две переменные подписи и не выводит их значения в консоль. Запускайте её из корня репозитория. Переменные будут доступны процессу сборки и дочерним процессам в этом окне PowerShell; после его закрытия они исчезнут.

Если сборка выполняется в другом окружении или файл `.env` отсутствует, задайте эти две переменные другим безопасным способом. Используйте именно существующий закрытый ключ, соответствующий публичному ключу в `src-tauri/tauri.conf.json`. Не генерируйте новый ключ для публикации обновлений уже установленным пользователям: новые подписи не будут соответствовать ключу, которому доверяет их приложение.

**Безопасность:** не добавляйте `.env` с реальными секретами в Git, коммиты, публичные логи или установщик. Убедитесь, что файл исключён через `.gitignore`, и не публикуйте значения ключа и пароля. Официальная документация: [Tauri Updater — Signing updates](https://v2.tauri.app/plugin/updater/).

## Диагностика

### `npm` или `node` не найдены

Проверьте установку Node.js и откройте новое окно PowerShell. Убедитесь, что команды `node --version` и `npm --version` возвращают версии.

### Ошибка компиляции Rust или `link.exe` не найден

Проверьте, что установлен Rust toolchain `stable-x86_64-pc-windows-msvc` и рабочая нагрузка **Desktop development with C++** в Visual Studio Build Tools. После установки перезапустите терминал.

### Не найден Backend sidecar

Проверьте, что подготовленный Backend находится по пути `backend/output/backend-x86_64-pc-windows-msvc.exe`. Также проверьте результат команды `rustc --print host-tuple` и соответствие суффикса целевой платформы.

### Не запускается окно приложения или отсутствует WebView

Проверьте наличие Microsoft Edge WebView2 Runtime. При необходимости установите Evergreen Runtime с официального сайта Microsoft.

### Порт 1420 занят

Vite настроен на фиксированный порт `1420` и не переключается автоматически на другой. Освободите порт или завершите другой процесс разработки, который его использует.

### Сборка updater-артефактов завершается ошибкой подписи

Проверьте, что переменная `TAURI_SIGNING_PRIVATE_KEY` указывает на существующий закрытый ключ проекта, а при необходимости задана правильная переменная `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Не заменяйте публичный ключ в конфигурации случайно сгенерированным ключом.

---

## Полезные ссылки

- [Официальная документация Tauri 2](https://v2.tauri.app/)
- [Системные требования Tauri для Windows](https://v2.tauri.app/start/prerequisites/)
- [Разработка приложения Tauri](https://v2.tauri.app/develop/)
- [Подключение внешних бинарных файлов (sidecar)](https://v2.tauri.app/develop/sidecar/)
- [Плагин обновлений Tauri](https://v2.tauri.app/plugin/updater/)
- [Документация Backend PrintNum](../backend/README.md)
- [Документация Extension PrintNum](../extension/README.md)
