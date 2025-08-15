import os
import json
from threading import Lock
import re

# Абсолютный путь к папке backend
BASE_DIR = os.path.dirname(__file__)
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")
OUTPUT_IMAGE = os.path.join(os.path.dirname(__file__), "screenshot.png")
Neiro_lang = 'eng+rus'
pattern = r'\d+-\d+'

PORT = 4025
INTERVAL = 0.2  # интервал скриншота
CONFIG_CHECK_INTERVAL = 0.1  # интервал проверки изменения конфига
Tesseract_FILE_PATH = os.path.join(BASE_DIR, "Tesseract-OCR", "tesseract.exe")
Tesseract_DIR_PATH = os.path.join(BASE_DIR, "Tesseract-OCR", "tessdata")

def format_number(text):
    if pattern:
        text = re.search(pattern, text).group() if re.search(pattern, text) else ''
        # добалвенныое условие
        if text:
            return f"{str(text).split('-')[0]}." if load_config()["address"]["Чонграский, 9"] else   f"{str(text).split('-')[0]}." if  int(str(text).split('-')[0]) < 450  else f"{text}."
    return text
config_lock = Lock()  # глобальный замок для синхронизации доступа

# Загрузка конфигурации из файла
def load_config():
    if os.path.exists(CONFIG_PATH):
        try:
            with config_lock:
                if os.path.getsize(CONFIG_PATH) == 0:
                    raise ValueError("Файл пустой")
                with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"[Ошибка чтения конфига]: {e}")
    return {}

# Сохранение данных в конфигурационный файл
def save_config(config):
    try:
        with config_lock:
            with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Ошибка сохранения конфига]: {e}")