import os
import json
from threading import Lock

# Пути к файлам и папкам
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Безопасное получение APPDATA (с фолбеком на случай отсутствия переменной в окружении)
APP_DIR = os.path.join(os.environ.get('APPDATA', BASE_DIR), "PrintNum")
os.makedirs(APP_DIR, exist_ok=True)
CONFIG_PATH = os.path.join(APP_DIR, "config.json")

lastUpdateConfig = 0
config = {}

config_lock = Lock()  # глобальный замок для синхронизации доступа


def load_config():
    global config, lastUpdateConfig

    """Загрузка конфигурации из файла (только чтение с кешированием)"""

    if not os.path.exists(CONFIG_PATH):
        with config_lock:
            config = {}
            lastUpdateConfig = 0
        return config

    # Быстрая проверка mtime вне блокировки (оптимизация)
    try:
        current_mtime = os.path.getmtime(CONFIG_PATH)
    except OSError:
        current_mtime = 0

    if current_mtime == lastUpdateConfig:
        return config

    # Критическая секция для синхронизации потоков
    with config_lock:
        # Повторная проверка внутри блокировки (Double-Checked Locking)
        try:
            current_mtime = os.path.getmtime(CONFIG_PATH)
        except OSError:
            config = {}
            return config

        if current_mtime == lastUpdateConfig:
            return config

        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    config = {}
                else:
                    config = json.loads(content)
            
            # Обновляем mtime только после успешного чтения файла
            lastUpdateConfig = current_mtime

        except Exception as e:
            print(f"[Ошибка чтения конфига]: {e}")
            # В случае ошибки не сбрасываем lastUpdateConfig, 
            # чтобы следующий поток попытался перечитать файл
            config = {}

    return config
