import os
import json
from threading import Lock

# # ---------------------------# Пути к файлам и папкам # ---------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

APP_DIR = os.path.join(os.environ['LOCALAPPDATA'], "PrintNum")
os.makedirs(APP_DIR, exist_ok=True)
CONFIG_PATH = os.path.join(APP_DIR, "config2.json")

lastUpdateConfig = 0
config = None

listPapers = ["30*20", "40*30", "43*25", "50*70", "58*40", "75*120", "100*150"]

DEFAULT_CONFIG = {
    "printer": "",
    "running": True,
    "hybrid": False,
    "idNum": False,
    "endLine": False,
    "paper": "30*20",
    "expand": 500,
}

config_lock = Lock()  # глобальный замок для синхронизации доступа

# Загрузка конфигурации из файла
def load_config():
    global config, lastUpdateConfig
    """Загрузка конфигурации из файла. Не перезаписывает файл без необходимости."""
    if os.path.exists(CONFIG_PATH):

        last_update = os.path.getmtime(CONFIG_PATH)
        """Читаем конфиг, только если он был изменен, или возвращаем последний"""
        if last_update != lastUpdateConfig:
            lastUpdateConfig = last_update

            try:
                with config_lock:
                    if os.path.getsize(CONFIG_PATH) == 0:
                        raise ValueError("Файл пустой")
                    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                        config = json.load(f)

                keys = DEFAULT_CONFIG.keys()
                curConfig = config.keys()

                # проверка на актуальность конфига
                if set(keys) != set(curConfig):
                    config = DEFAULT_CONFIG.copy()

                    save_config(config)
            except Exception as e:
                print(f"[Ошибка чтения конфига]: {e}")
        return config
    else:
        config = DEFAULT_CONFIG.copy()
        save_config(config)
    return config


# Сохранение данных в конфигурационный файл
def save_config(new_config):
    try:
        with config_lock:
            with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                json.dump(new_config, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Ошибка сохранения конфига]: {e}")
