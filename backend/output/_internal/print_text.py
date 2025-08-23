import re
from copy import copy
import win32print
import win32ui
import pywintypes
from data import load_config, FONT as f, pattern


def format_number(text):
    text = re.search(pattern, text).group() if re.search(pattern, text) else ''
    return str(text)


def status_printer():
    config = load_config()
    """Return True if printer is offline, False if ready,
    or None if printer name is invalid."""
    try:
        handle = win32print.OpenPrinter(config['printer'])
    except pywintypes.error as e:
        if e.winerror == 1801:  # printer not found
            return None
        raise
    info = win32print.GetPrinter(handle, 2)
    attrs = info['Attributes']

    # Проверка: принтер в офлайне?
    PRINTER_ATTRIBUTE_WORK_OFFLINE = 0x00000400
    is_offline = bool(attrs & PRINTER_ATTRIBUTE_WORK_OFFLINE)

    return is_offline


def print_text(text):
    config = load_config()
    if config["printer"] != '' and text:
        try:
            # Создаем контекст принтера
            printer_dc = win32ui.CreateDC()
            printer_dc.CreatePrinterDC(config["printer"])

            # Получаем размер printable area
            horz_res = printer_dc.GetDeviceCaps(8)  # HORZRES
            vert_res = printer_dc.GetDeviceCaps(10)  # VERTRES
            print(f"Полученный текст: '{text}'")
            FONT = copy(f)
            new_text = format_number(text)
            text = f"{str(new_text).split('-')[0]}."
            if int(new_text.replace('.', '').split('-')[0]) > 450:
                # Создаем шрифт
                FONT['height'] = 75
                FONT['weight'] = 500
                text = f"{new_text}."

            font = win32ui.CreateFont(FONT)
            printer_dc.SelectObject(font)

            # Вычисляем размеры текста
            text_size = printer_dc.GetTextExtent(text)
            text_width, text_height = text_size

            # Центрируем
            x = (horz_res - text_width) // 2
            y = (vert_res - text_height) // 2
            print(f'Отправил на распечатку: \'{text}\' ')
            # Печать
            printer_dc.StartDoc(f"Ячейка {text}")
            printer_dc.StartPage()
            printer_dc.TextOut(x, y, text)
            printer_dc.EndPage()
            printer_dc.EndDoc()
            printer_dc.DeleteDC()
        except Exception as e:
            print('Ошибка при печати:', e)
