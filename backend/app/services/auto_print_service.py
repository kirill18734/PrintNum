"""Обрабатывает автопечать и применяет правила исключения текста."""

from app.domain.filter_rules import find_excluded_rule


class AutoPrintService:
    def __init__(self, config_repository, printer_service):
        self.config_repository = config_repository
        self.printer_service = printer_service

    def process(self, text):
        if not text:
            return {"status": "ignored"}

        config = self.config_repository.load()
        if not config.get("running"):
            return {"status": "ignored"}

        matched_rule = find_excluded_rule(text, config.get("excludedTexts", []))
        if matched_rule:
            return {"status": "skipped", "rule": matched_rule}

        if config.get("printer") and self.printer_service.is_online(
            config["printer"]
        ):
            self.printer_service.print_number(text, config)
            return {"status": "printed"}
        return {"status": "ignored"}
