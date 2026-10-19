import win32print
import win32timezone  # модуль для компиляции, нужен для очистки очереди
from data import load_config

def listPrinters():
    # Получение списка всех подключенных принтеров
    printers = win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS)
    return [p[2] for p in printers]

def status_printer():
    config = load_config()
    printer_name = config.get('printer', '').strip()  # Безопасное чтение dict
    if not printer_name:
        return False

    handle = None  # Инициализируем переменную заранее
    try:
        handle = win32print.OpenPrinter(printer_name)
        info = win32print.GetPrinter(handle, 2)
        attrs = info['Attributes']
        status = info['Status']

        # 1. Проверяем физическое отключение
        PRINTER_ATTRIBUTE_WORK_OFFLINE = 0x00000400
        if bool(attrs & PRINTER_ATTRIBUTE_WORK_OFFLINE):
            return False

        # 2. Проверяем аппаратные ошибки
        critical_errors = (
                win32print.PRINTER_STATUS_ERROR |
                win32print.PRINTER_STATUS_PAPER_JAM |
                win32print.PRINTER_STATUS_PAPER_OUT |
                win32print.PRINTER_STATUS_OFFLINE
        )
        if bool(status & critical_errors):
            return False

        return True

    except Exception:
        return False
    finally:
        if handle:  # Закрываем дескриптор только если он был успешно открыт
            win32print.ClosePrinter(handle)

def clear_printer_queue():
    config = load_config()
    printer_name = config.get('printer', '').strip()
    
    if not printer_name:
        return False

    print(f"Попытка очистки очереди для принтера: '{printer_name}'...")
    
    h_printer = None
    try:
        # Открываем принтер с правами на администрирование
        defaults = {"DesiredAccess": win32print.PRINTER_ACCESS_ADMINISTER}
        h_printer = win32print.OpenPrinter(printer_name, defaults)
        
        # Команда PURGE полностью удаляет все задания из очереди принтера
        win32print.SetPrinter(h_printer, 0, None, win32print.PRINTER_CONTROL_PURGE)
        
        print(f"Очередь принтера '{printer_name}' успешно очищена.")
        return True
        
    except Exception as e:
        print(f"Не удалось очистить очередь принтера. Ошибка: {e}")
        return False
        
    finally:
        if h_printer:
            win32print.ClosePrinter(h_printer)
