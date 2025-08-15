import time
from time import sleep
from PIL import Image, ImageGrab
import pytesseract
import os
from data import load_config, OUTPUT_IMAGE, CONFIG_PATH, Tesseract_FILE_PATH, Tesseract_DIR_PATH, \
    CONFIG_CHECK_INTERVAL, INTERVAL, Neiro_lang, format_number,save_config
from print_text import print_text
import tkinter as tk


def select_area():
    """Функция для интерактивного выбора области"""

    def on_button_press(event):
        nonlocal start_x, start_y, rect_cut
        start_x, start_y = event.x, event.y
        rect_cut = canvas.create_rectangle(start_x, start_y, start_x, start_y, outline="red", width=2)

    def on_move_press(event):
        curX, curY = event.x, event.y
        canvas.coords(rect_cut, start_x, start_y, curX, curY)

    def on_button_release(event):
        x1, y1, x2, y2 = canvas.coords(rect_cut)
        x = int(min(x1, x2))
        y = int(min(y1, y2))
        width = int(abs(x2 - x1))
        height = int(abs(y2 - y1))

        # Полупрозрачный оверлей
        canvas.delete("overlay")
        canvas.create_rectangle(0, 0, screen_width, screen_height, fill="black", stipple="gray50", tags="overlay")
        canvas.create_rectangle(x, y, x + width, y + height, fill=root['bg'], outline="red", width=2)

        # Сохраняем координаты
        config = load_config()
        config["area"] = {"x": x, "y": y, "width": width, "height": height}
        save_config(config)

        root.after(1000, root.destroy)

    root = tk.Tk()
    root.attributes("-fullscreen", True)
    root.attributes("-alpha", 0.5)
    root.attributes("-topmost", True)

    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()

    canvas = tk.Canvas(root, bg=root['bg'], highlightthickness=0)
    canvas.pack(fill=tk.BOTH, expand=True)

    start_x = start_y = 0
    rect_cut = None

    canvas.bind("<ButtonPress-1>", on_button_press)
    canvas.bind("<B1-Motion>", on_move_press)
    canvas.bind("<ButtonRelease-1>", on_button_release)

    root.mainloop()


def show_area():
    """Функция для просмотра сохраненной области"""
    config = load_config()
    if "area" not in config:
        print("Сначала нужно выбрать область!")
        return

    x = config["area"]["x"]
    y = config["area"]["y"]
    width = config["area"]["width"]
    height = config["area"]["height"]

    root = tk.Tk()
    root.attributes("-fullscreen", True)
    root.attributes("-alpha", 0.5)
    root.attributes("-topmost", True)

    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()

    canvas = tk.Canvas(root, bg=root['bg'], highlightthickness=0)
    canvas.pack(fill=tk.BOTH, expand=True)

    # Полупрозрачный оверлей
    canvas.create_rectangle(0, 0, screen_width, screen_height, fill="black", stipple="gray50", tags="overlay")
    canvas.create_rectangle(x, y, x + width, y + height, fill=root['bg'], outline="red", width=2)

    # Закрытие через 3 секунды для демонстрации
    root.after(1000, root.destroy)
    root.mainloop()


def ImageText():
    pytesseract.pytesseract.tesseract_cmd = Tesseract_FILE_PATH

    # Укажи путь к tessdata
    os.environ['TESSDATA_PREFIX'] = Tesseract_DIR_PATH
    # Загрузи изображение
    img = Image.open(OUTPUT_IMAGE)

    # Распознай текст
    text = pytesseract.image_to_string(img, lang=Neiro_lang)
    return text


def main_neiro():
    print("[INFO] main_neiro запущен")
    last_coords = None
    last_config_mtime = 0
    last_config_check = 0
    last_text = None
    first_valid_skipped = False  # <-- флаг для пропуска первого валидного текста
    try:
        while True:
            config = load_config()  # загружаем один раз
            if not config:  # если файл пустой или ошибка чтения
                sleep(CONFIG_CHECK_INTERVAL)
                continue

            if config.get('is_running') and config.get('mode') == 'neiro':
                now = time.time()

                # Проверка конфигурации не чаще, чем раз в CONFIG_CHECK_INTERVAL
                if now - last_config_check > CONFIG_CHECK_INTERVAL:
                    current_mtime = os.path.getmtime(CONFIG_PATH)
                    if current_mtime != last_config_mtime:
                        last_coords = config.get("area")
                        is_running = config.get("is_running", False)
                        print(f"[INFO] Конфиг обновлён: is_running={is_running}, area={last_coords}")
                        if not is_running:
                            print("[INFO] main() завершает работу по флагу is_running=False")
                            break
                        last_config_mtime = current_mtime
                    last_config_check = now

                # Если координаты заданы, делаем скриншот
                if last_coords:
                    x = last_coords.get("x", 0)
                    y = last_coords.get("y", 0)
                    w = last_coords.get("width", 0)
                    h = last_coords.get("height", 0)

                    screenshot = ImageGrab.grab(bbox=(x, y, x + w, y + h))
                    screenshot.save(OUTPUT_IMAGE, "PNG")

                    text = format_number(ImageText())
                    print("Найденный текст:", text, "| Длина:", len(text))
                    if text != last_text and text:
                        if not first_valid_skipped:
                            print(f"[INFO] Пропущен первый валидный текст: {text}")
                            first_valid_skipped = True
                        else:
                            print("[INFO] Распечатка текста", text)
                            print_text(text)
                        last_text = text

            sleep(INTERVAL)
    except Exception as e:
        print(f"[ERROR] main() завершился с ошибкой: {e}")
# Пример использования:
# select_area()  # для интерактивного выбора
# show_area()    # для просмотра сохраненной области
