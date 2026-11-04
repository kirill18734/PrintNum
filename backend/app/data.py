
import os
import json
from threading import Lock


# Пути поиска конфигурации.
APPDATA_DIR = os.environ.get("APPDATA")

APPDATA_CONFIG_PATH = (
    os.path.join(APPDATA_DIR, "PrintNum", "config.json")
    if APPDATA_DIR
    else None
)

LOCAL_CONFIG_PATH = os.path.join(os.getcwd(), "config.json")

lastUpdateConfig = None
config = {}

config_lock = Lock()


def _get_config_path():
    """
    Возвращает путь к существующему конфигу.

    Приоритет:
    1. %APPDATA%/PrintNum/config.json
    2. config.json в текущей директории
    """

    if (
        APPDATA_CONFIG_PATH
        and os.path.isfile(APPDATA_CONFIG_PATH)
    ):
        return APPDATA_CONFIG_PATH

    if os.path.isfile(LOCAL_CONFIG_PATH):
        return LOCAL_CONFIG_PATH

    return None


def load_config():
    """Загружает конфигурацию с кешированием по времени изменения."""
    global config, lastUpdateConfig

    with config_lock:
        config_path = _get_config_path()

        if config_path is None:
            config = {}
            lastUpdateConfig = None
            return {}

        try:
            current_mtime = os.path.getmtime(config_path)
        except OSError:
            # При временной ошибке оставляем последний рабочий кеш.
            return config.copy()

        if current_mtime == lastUpdateConfig:
            return config.copy()

        try:
            with open(config_path, "r", encoding="utf-8") as file:
                content = file.read().strip()

            parsed_config = json.loads(content) if content else {}

            if not isinstance(parsed_config, dict):
                raise ValueError(
                    "Корень config.json должен быть JSON-объектом"
                )

        except (OSError, json.JSONDecodeError, ValueError) as error:
            print(f"[Ошибка чтения конфига]: {error}")

            # Не заменяем рабочую конфигурацию повреждёнными данными.
            return config.copy()

        config = parsed_config
        lastUpdateConfig = current_mtime

        return config.copy()
