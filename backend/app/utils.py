
import win32print
import win32timezone  # Нужен для сборки приложения и работы с очередью.

from app.data import load_config


PRINTNUM_DOCUMENT_PREFIX = "PrintNum:"


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
    """Удаляет задания PrintNum из очереди настроенного принтера."""
    config = load_config()
    printer_name = config.get("printer", "").strip()

    if not printer_name:
        raise ValueError("Не задан принтер для очистки очереди")

    handle = None

    try:
        handle = win32print.OpenPrinter(
            printer_name,
            {
                "DesiredAccess": win32print.PRINTER_ACCESS_ADMINISTER,
            },
        )

        jobs = win32print.EnumJobs(handle, 0, -1, 1)

        for job in jobs:
            document = job.get("pDocument")

            if (
                isinstance(document, str)
                and document.startswith(PRINTNUM_DOCUMENT_PREFIX)
            ):
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
