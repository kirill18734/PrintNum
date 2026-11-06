# app/config.py

import os
import json
from threading import Lock


APP_NAME = "PrintNum"

APPDATA_DIR = os.environ.get("APPDATA")

APPDATA_CONFIG_PATH = (
    os.path.join(APPDATA_DIR, APP_NAME, "config.json")
    if APPDATA_DIR else None
)

LOCAL_CONFIG_PATH = os.path.join(
    os.getcwd(), "config.json"
)


# ============================================================
# CACHE
# ============================================================

config = {}
lastUpdateConfig = None

config_lock = Lock()


# ============================================================
# PATHS
# ============================================================

def _get_config_path():
    """Возвращает путь к существующему конфигу."""

    if (
        APPDATA_CONFIG_PATH
        and os.path.isfile(APPDATA_CONFIG_PATH)
    ):
        return APPDATA_CONFIG_PATH

    if os.path.isfile(LOCAL_CONFIG_PATH):
        return LOCAL_CONFIG_PATH

    return None


def _get_save_path():
    """Возвращает предпочтительный путь для сохранения."""

    if APPDATA_CONFIG_PATH:
        return APPDATA_CONFIG_PATH

    return LOCAL_CONFIG_PATH


# ============================================================
# LOAD CONFIG
# ============================================================

def load_config():
    """Загружает конфигурацию с кешированием."""

    global config, lastUpdateConfig

    with config_lock:

        config_path = _get_config_path()

        if config_path is None:
            config = {}
            lastUpdateConfig = None
            return {}

        try:
            current_mtime = os.stat(config_path).st_mtime_ns

        except OSError:
            return config.copy()

        if current_mtime != lastUpdateConfig:

            try:
                with open(
                    config_path,
                    "r",
                    encoding="utf-8",
                ) as file:
                    content = file.read().strip()

                parsed_config = (
                    json.loads(content) if content else {}
                )

                if not isinstance(parsed_config, dict):
                    raise ValueError(
                        "Корень config.json должен быть JSON-объектом"
                    )

            except (
                OSError,
                json.JSONDecodeError,
                ValueError,
            ) as error:

                print(f"[Ошибка чтения конфига]: {error}")

            else:
                config = parsed_config
                lastUpdateConfig = current_mtime

        return config.copy()


# ============================================================
# SAVE CONFIG
# ============================================================

def save_config(new_config):
    """Сохраняет конфигурацию и обновляет кеш."""

    global config, lastUpdateConfig

    if not isinstance(new_config, dict):
        raise TypeError("Конфигурация должна быть словарём")

    with config_lock:

        config_path = _get_save_path()

        os.makedirs(
            os.path.dirname(config_path),
            exist_ok=True,
        )

        try:
            with open(
                config_path,
                "w",
                encoding="utf-8",
            ) as file:

                json.dump(
                    new_config,
                    file,
                    ensure_ascii=False,
                    indent=4,
                )

            config = new_config.copy()
            lastUpdateConfig = os.stat(
                config_path
            ).st_mtime_ns

        except OSError as error:
            print(f"[Ошибка сохранения конфига]: {error}")
            raise