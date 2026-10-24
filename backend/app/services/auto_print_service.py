"""Обрабатывает автопечать и применяет правила исключения текста."""

from copy import deepcopy

from app.domain.filter_rules import find_excluded_rule


class AutoPrintService:
    def __init__(
        self, config_repository, printer_service, status_cache, refresh_status_before_print=False
    ):
        self.config_repository = config_repository
        self.printer_service = printer_service
        self.status_cache = status_cache
        self.refresh_status_before_print = refresh_status_before_print

    def process(self, text, print_text=None, on_progress=None):
        """Publish accumulated step snapshots; propagate processing errors to the caller."""
        steps = []

        def report(stage, status, message):
            steps.append({"stage": stage, "status": status, "message": message})
            if on_progress is not None:
                on_progress(deepcopy(steps))

        def blocked(message):
            report("readiness", "blocked", message)
            report("result", "blocked", f"Не напечатан: {message.lower()}")
            return {"status": "ignored", "steps": steps}

        report("received", "complete", "Текст получен")
        if print_text is not None and print_text != text:
            report("received", "complete", f"Переименовано в {print_text}")
        if not text:
            report("result", "skipped", "Получен пустой текст")
            return {"status": "ignored", "steps": steps}

        config = self.config_repository.load()

        matched_rule = find_excluded_rule(text, config.get("excludedTexts", []))
        if matched_rule:
            report("exclusions", "skipped", f"Найдено исключение «{matched_rule}»")
            report("result", "skipped", "Не напечатан: текст соответствует исключению")
            return {"status": "skipped", "rule": matched_rule, "steps": steps}

        report("exclusions", "complete", "Исключений не найдено")
        printer_name = config.get("printer")
        if not printer_name:
            return blocked("Принтер не выбран")
        cached_status = self.status_cache.get()
        if self.refresh_status_before_print or cached_status is None:
            is_online = self.printer_service.is_online(printer_name)
            if self.refresh_status_before_print:
                self.status_cache.set(is_online)
        else:
            is_online = cached_status

        if not is_online:
            return blocked("Принтер недоступен")

        report("readiness", "complete", "Принтер доступен")
        output_text = print_text if print_text is not None else text
        self.printer_service.print_number(output_text, config)
        # Formatting happens inside the adapter, so it is confirmed only after return.
        report("formatting", "complete", "Форматирование выполнено")
        report(
            "result",
            "complete",
            f"Отправлен на печать: {output_text}"
            if print_text is not None
            else "Отправлен на печать",
        )
        return {"status": "printed", "steps": steps}
