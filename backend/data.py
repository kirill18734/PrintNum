import os
import json
from threading import Lock

# # ---------------------------# Пути к файлам и папкам # ---------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

APP_DIR = os.path.join(os.environ['APPDATA'], "PrintNum")
os.makedirs(APP_DIR, exist_ok=True)
CONFIG_PATH = os.path.join(APP_DIR, "config.json")

lastUpdateConfig = 0
config = None

config_lock = Lock()  # глобальный замок для синхронизации доступа


def load_config():
    global config, lastUpdateConfig

    """Загрузка конфигурации из файла (только чтение с кешированием)"""

    if not os.path.exists(CONFIG_PATH):
        config = {}
        return config

    last_update = os.path.getmtime(CONFIG_PATH)

    # если файл не менялся — возвращаем кеш
    if last_update == lastUpdateConfig:
        return config

    lastUpdateConfig = last_update

    try:
        with config_lock:
            if os.path.getsize(CONFIG_PATH) == 0:
                config = {}
                return config

            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                config = json.load(f)

    except Exception as e:
        print(f"[Ошибка чтения конфига]: {e}")
        config = {}

    return config
