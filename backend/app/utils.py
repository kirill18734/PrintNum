
import win32print
import win32timezone  # Нужен для сборки приложения и работы с очередью.
from app.data import load_config
import win32con

def find_excluded_rule(text, rules):
    """Находит первое правило исключения, совпавшее с текстом."""
    if not isinstance(text, str) or not isinstance(rules, list):
        return None

    normalized_text = text.casefold()

    for rule in rules:
        if isinstance(rule, str) and rule.strip():
            normalized_rule = rule.strip()

            if normalized_rule.casefold() in normalized_text:
                return normalized_rule

    return None


def list_printers():
    """Возвращает локальные и подключённые принтеры."""
    printers = win32print.EnumPrinters(
        win32print.PRINTER_ENUM_LOCAL
        | win32print.PRINTER_ENUM_CONNECTIONS
    )

    return [printer[2] for printer in printers]





def calculate_dimensions(hdc, paper_size_str):
    """Переводит физические размеры бумаги из мм в пиксели принтера."""
    try:
        width_mm, height_mm = map(int, paper_size_str.split("*"))
    except (ValueError, AttributeError):
        raise ValueError(
            "Размер бумаги должен иметь формат WIDTH*HEIGHT"
        ) from None

    if width_mm <= 0 or height_mm <= 0:
        raise ValueError("Размеры бумаги должны быть положительными")

    dpi_x = hdc.GetDeviceCaps(win32con.LOGPIXELSX)
    dpi_y = hdc.GetDeviceCaps(win32con.LOGPIXELSY)

    if dpi_x <= 0 or dpi_y <= 0:
        raise ValueError("Не удалось определить DPI принтера")

    width_px = int((width_mm / 25.4) * dpi_x)
    height_px = int((height_mm / 25.4) * dpi_y)

    margin_x = int(width_px * 0.05)
    margin_y = int(height_px * 0.05)

    return {
        "width_px": width_px,
        "height_px": height_px,
        "margin_x": margin_x,
        "margin_y": margin_y,
        "max_allowed_w": width_px - (margin_x * 2),
    }


def status_printer():
    """Проверяет доступность настроенного принтера."""
    config = load_config()
    printer_name = config.get("printer", "").strip()

    if not printer_name:
        return False

    handle = None

    try:
        handle = win32print.OpenPrinter(printer_name)
        info = win32print.GetPrinter(handle, 2)

        attributes = info["Attributes"]
        status = info["Status"]

        if attributes & win32print.PRINTER_ATTRIBUTE_WORK_OFFLINE:
            return False

        critical_errors = (
            win32print.PRINTER_STATUS_ERROR
            | win32print.PRINTER_STATUS_PAPER_JAM
            | win32print.PRINTER_STATUS_PAPER_OUT
            | win32print.PRINTER_STATUS_OFFLINE
        )

        if status & critical_errors:
            return False

        return True

    except Exception:
        return False

    finally:
        if handle is not None:
            win32print.ClosePrinter(handle)

def clear_printer_queue():
    """Полностью очищает очередь настроенного принтера."""
    config = load_config()
    printer_name = config.get("printer", "").strip()

    if not printer_name:
        raise ValueError("Не задан принтер для очистки очереди")

    handle = None

    try:
        handle = win32print.OpenPrinter(
            printer_name,
            {
                "DesiredAccess": win32print.PRINTER_ACCESS_USE,
            },
        )

        jobs = win32print.EnumJobs(handle, 0, -1, 1)

        if not jobs:
            return

        for job in jobs:
            win32print.SetJob(
                handle,
                job["JobId"],
                0,
                None,
                win32print.JOB_CONTROL_DELETE,
            )

    finally:
        if handle is not None:
            win32print.ClosePrinter(handle)