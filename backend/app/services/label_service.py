"""Проверяет запросы на ручную печать этикеток и отправляет их принтеру."""

from app.domain.label_data import LabelRequestError, parse_label_request


class LabelService:
    def __init__(self, config_repository, printer_service):
        self.config_repository = config_repository
        self.printer_service = printer_service

    def print_label(self, request_body):
        label = parse_label_request(request_body)
        config = self.config_repository.load()
        printer_name = config.get("printer")
        if not isinstance(printer_name, str) or not printer_name.strip():
            raise PrinterNotConfiguredError("Сначала выберите принтер")

        if not self.printer_service.is_online(printer_name):
            raise PrinterUnavailableError("Принтер не готов к печати")

        self.printer_service.print_label(label, config)


class PrinterNotConfiguredError(RuntimeError):
    """Raised when no printer has been selected."""


class PrinterUnavailableError(RuntimeError):
    """Raised when the selected printer cannot accept print jobs."""


__all__ = [
    "LabelRequestError",
    "LabelService",
    "PrinterNotConfiguredError",
    "PrinterUnavailableError",
]
