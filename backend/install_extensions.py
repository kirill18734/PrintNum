"""
===============================================================================
ВНИМАНИЕ!

На данный момент этот скрипт НЕ используется и НЕ входит в основную сборку.

Назначение:
    Автоматически регистрирует расширение Chrome Web Store в реестре Windows
    (HKEY_CURRENT_USER) для поддерживаемых Chromium-браузеров
    (Google Chrome, Microsoft Edge, Brave, Vivaldi, Opera, Яндекс.Браузер).

Принцип работы:
    - Проверяет наличие поддерживаемых браузеров.
    - Создает ключ:
        Software\<Browser>\Extensions\<ExtensionID>
    - Добавляет параметр:
        update_url = https://clients2.google.com/service/update2/crx

После следующего запуска браузера расширение может быть автоматически
обнаружено и предложено к установке (поведение зависит от браузера и его версии).

Причина отключения:
    В текущей версии проекта автоматическая регистрация расширения отключена
    и этот скрипт не вызывается из основного приложения.

При необходимости его можно подключить, вызвав функцию main() из основного
скрипта запуска.
===============================================================================
"""

import winreg

# ==========================
# Настройки
# ==========================

# Можно указать несколько расширений
EXTENSIONS = ["pebpcdibpeodhdkbeniijidffpfpiagn"]

UPDATE_URL = "https://clients2.google.com/service/update2/crx"

# Поддерживаемые браузеры
BROWSERS = [
    {
        "name": "Google Chrome",
        "check": r"Software\Google\Chrome",
        "extensions": r"Software\Google\Chrome\Extensions",
    },
    {
        "name": "Microsoft Edge",
        "check": r"Software\Microsoft\Edge",
        "extensions": r"Software\Microsoft\Edge\Extensions",
    },
    {
        "name": "Brave",
        "check": r"Software\BraveSoftware\Brave",
        "extensions": r"Software\BraveSoftware\Brave\Extensions",
    },
    {
        "name": "Vivaldi",
        "check": r"Software\Vivaldi",
        "extensions": r"Software\Vivaldi\Extensions",
    },
    {
        "name": "Opera",
        "check": r"Software\Opera Software",
        "extensions": r"Software\Opera Software\Extensions",
    },
    {
        "name": "Yandex Browser",
        "check": r"Software\Yandex\YandexBrowser",
        "extensions": r"Software\Yandex\YandexBrowser\Extensions",
    },
]

ROOT = winreg.HKEY_CURRENT_USER


# ==========================
# Проверка существования ключа
# ==========================

def key_exists(path):
    try:
        winreg.OpenKey(ROOT, path).Close()
        return True
    except FileNotFoundError:
        return False


# ==========================
# Добавление расширения
# ==========================

def install_extension(browser, extension_id):
    reg_path = browser["extensions"] + "\\" + extension_id

    key = winreg.CreateKey(ROOT, reg_path)

    try:
        current, _ = winreg.QueryValueEx(key, "update_url")

        if current == UPDATE_URL:
            print(f"  {extension_id} уже зарегистрировано")
            return

    except FileNotFoundError:
        pass

    winreg.SetValueEx(
        key,
        "update_url",
        0,
        winreg.REG_SZ,
        UPDATE_URL
    )

    winreg.CloseKey(key)

    print(f"  Добавлено: {extension_id}")


# ==========================
# Основная программа
# ==========================

def main():
    print()

    for browser in BROWSERS:

        if not key_exists(browser["check"]):
            print(f"[Пропуск] {browser['name']} не найден")
            continue

        print(f"[{browser['name']}]")

        for extension in EXTENSIONS:
            install_extension(browser, extension)

        print()

    print("Готово.")


if __name__ == "__main__":
    main()
