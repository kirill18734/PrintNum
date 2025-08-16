import os
import json
from threading import Lock
import re

# ---------------------------
# Пути к файлам и папкам
# ---------------------------
# Папка для ресурсов рядом с exe или скриптом
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_IMAGE = os.path.join(BASE_DIR, "screenshot.png")
Tesseract_FILE_PATH = os.path.join(BASE_DIR, "Tesseract-OCR", "tesseract.exe")
Tesseract_DIR_PATH = os.path.join(BASE_DIR, "Tesseract-OCR", "tessdata")

# Папка для конфигурации в AppData (чтобы изменения сохранялись)
APP_DIR = os.path.join(os.environ['LOCALAPPDATA'], "PrintNum")
os.makedirs(APP_DIR, exist_ok=True)
CONFIG_PATH = os.path.join(APP_DIR, "config.json")

# ---------------------------
# Конфигурация по умолчанию
# ---------------------------
DEFAULT_CONFIG = {
  "theme": "night",
  "mode": "expansion",
  "printer": "",
  "is_running": False,
  "address": {
    "Чонграский, 9": True,
    "3, Павелецкий проезд, 4": False
  },
  "font": {
    "name": "Arial",
    "height": 130,
    "weight": 400
  },
  "area": {
    "x": 0,
    "y": 0,
    "width": 0,
    "height": 0
  }
}

# ---------------------------
# Настройки программы
# ---------------------------
Neiro_lang = 'eng+rus'
pattern = r'\d+-\d+'
PORT = 4025
INTERVAL = 0.2  # интервал скриншота
CONFIG_CHECK_INTERVAL = 0.1  # интервал проверки изменения конфига

# ---------------------------
# Замок для синхронизации
# ---------------------------
config_lock = Lock()

# ---------------------------
# Функции для работы с конфигом
# ---------------------------
# Загрузка конфигурации из файла def load_config(): if os.path.exists(CONFIG_PATH): try: with config_lock: if os.path.getsize(CONFIG_PATH) == 0: raise ValueError("Файл пустой") with open(CONFIG_PATH, "r", encoding="utf-8") as f: return json.load(f) except Exception as e: print(f"[Ошибка чтения конфига]: {e}") return {}
def load_config():
    """Загрузка конфигурации из файла. Не перезаписывает файл без необходимости."""
    config = DEFAULT_CONFIG.copy()

    if os.path.exists(CONFIG_PATH):
        try:
            with config_lock:
                if os.path.getsize(CONFIG_PATH) == 0:
                    raise ValueError("Файл пустой")
                with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"[Ошибка чтения конфига]: {e}")
    else:
        print('Не нешел конфиг, создаю новый')
        save_config(config)
    return config


def save_config(config):
    """Сохранение конфигурации в файл."""
    try:
        with config_lock:
            with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Ошибка сохранения конфига]: {e}")

# ---------------------------
# Форматирование номера
# ---------------------------
def format_number(text):
    """Форматирует текст по шаблону pattern и дополнительным условиям."""
    if pattern:
        match = re.search(pattern, text)
        text = match.group() if match else ''
        if text:
            config = load_config()
            if config["address"].get("Чонграский, 9"):
                return f"{str(text).split('-')[0]}."
            elif int(str(text).split('-')[0]) < 450:
                return f"{str(text).split('-')[0]}."
            else:
                return f"{text}."
    return text
