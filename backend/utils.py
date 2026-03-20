import win32print
import pywintypes
import re
from data import load_config, dataPattarn


def format_number(text, search):
    default = search['default']
    expand = int(search['expand'])
    curPattern = dataPattarn[default]

    # дополнительное условие для гибридного формата
    if expand > 1:
        num_part = text.split("-")[0]
        if num_part.isdigit() and int(num_part) >= expand:
            curPattern = dataPattarn["Полные номера (123-123)"]

    match = re.search(curPattern, text.replace(' ', ''))
    text = match.group() if match else ''
    return str(text)


def status_printer():

    config = load_config().copy()
    printer_name = config['printer']['default']
    if not printer_name:
        return False

    try:
        handle = win32print.OpenPrinter(printer_name)
    except pywintypes.error:
        return False

    try:
        info = win32print.GetPrinter(handle, 2)
        attrs = info['Attributes']

        PRINTER_ATTRIBUTE_WORK_OFFLINE = 0x00000400
        return not bool(attrs & PRINTER_ATTRIBUTE_WORK_OFFLINE)

    finally:
        win32print.ClosePrinter(handle)


def list_printers():
    config = load_config().copy()
    flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
    printers = win32print.EnumPrinters(flags)
    # В каждом кортеже третий элемент — это имя принтера
    printerNames = [""] + [p[2] for p in printers]
    return printerNames
