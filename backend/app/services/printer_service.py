"""Последовательно обрабатывает обращения к принтеру через системный адаптер."""

import threading


class PrinterService:
    """Serializes printer access and supplies current config to the adapter."""

    def __init__(self, adapter):
        self.adapter = adapter
        self._print_lock = threading.Lock()

    def list_printers(self):
        return self.adapter.list_printers()

    def is_online(self, printer_name):
        return self.adapter.is_online(printer_name)

    def _clear_queue(self, config):
        printer_name = config.get("printer")
        if not isinstance(printer_name, str) or not printer_name.strip():
            raise ValueError("Сначала выберите принтер")
        self.adapter.clear_queue(printer_name)

    def print_number(self, text, config):
        with self._print_lock:
            self._clear_queue(config)
            self.adapter.print_number(text, config)

    def print_label(self, label, config):
        with self._print_lock:
            self._clear_queue(config)
            self.adapter.print_label(
                content=label["content"],
                content_type=label["content_type"],
                code_image=label["code_image"],
                config=config,
                bold=label["bold"],
                underline=label["underline"],
                show_code_text=label["show_code_text"],
            )
