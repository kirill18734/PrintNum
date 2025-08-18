import os
import json
from threading import Lock
import re

import win32print

# ---------------------------
# Пути к файлам и папкам
# ---------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_IMAGE = os.path.join(os.path.dirname(__file__), "screenshot.png")
Tesseract_DIR_PATH = os.path.join(os.path.dirname(__file__),"Tesseract-OCR","tessdata")
Tesseract_FILE_PATH = os.path.join(os.path.dirname(__file__),"Tesseract-OCR","tesseract.exe")
# Папка для конфигурации в AppData (чтобы изменения сохранялись)
APP_DIR = os.path.join(os.environ['LOCALAPPDATA'], "PrintNum")
os.makedirs(APP_DIR, exist_ok=True)
CONFIG_PATH = os.path.join(APP_DIR, "config.json")

Neiro_lang = 'eng+rus'
pattern = r'\d+-\d+'

INTERVAL = 0.5  # интервал скриншота
CONFIG_CHECK_INTERVAL = 0.3  # интервал проверки изменения конфига
FONT = {
"name": "Arial",
"height": 130 ,# if addres["Чонграский, 9"] else  80,
"weight": 400,  # ширина
}

# ---------------------------
# Конфигурация по умолчанию
# ---------------------------
DEFAULT_CONFIG = {
  "mode": "extension",
  "theme": "dark",
  "printer": "",
  "area": {
    "x": 674,
    "y": 432,
    "width": 475,
    "height": 157
  },
  "is_running": False,
  "address": {
    "Чонграский, 9": False,
    "3, Павелецкий проезд, 4": True
  }
}

def list_printers():
    flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
    printers = win32print.EnumPrinters(flags)
    # В каждом кортеже третий элемент — это имя принтера
    printer_names = [p[2] for p in printers]
    return printer_names


config_lock = Lock()  # глобальный замок для синхронизации доступа

# Загрузка конфигурации из файла
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

# Сохранение данных в конфигурационный файл
def save_config(config):
    try:
        with config_lock:
            with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Ошибка сохранения конфига]: {e}")
