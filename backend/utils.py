"""Совместимые вспомогательные функции для работы с принтерами."""

from app.infrastructure.windows_printer import WindowsPrinterAdapter
from data import load_config

_printer = WindowsPrinterAdapter()


def listPrinters():
    return _printer.list_printers()

def status_printer():
    return _printer.is_online(load_config().get("printer", ""))
