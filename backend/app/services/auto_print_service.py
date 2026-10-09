"""Обрабатывает автопечать и применяет правила исключения текста."""

from app.domain.filter_rules import find_excluded_rule


class AutoPrintService:
    def __init__(self, config_repository, printer_service):
        self.config_repository = config_repository
        self.printer_service = printer_service

    def process(self, text):
        if not text:
            return {
                "status": "ignored",
                "steps": [
                    {"status": "complete", "message": "Текст получен"},
                    {"status": "skipped", "message": "Получен пустой текст"},
                ],
            }

        config = self.config_repository.load()
        if not config.get("running"):
            return {
                "status": "ignored",
                "steps": [
                    {"status": "complete", "message": "Текст получен"},
                    {
                        "status": "blocked",
                        "message": "Не напечатан: автопечать выключена",
                    },
                ],
            }

        matched_rule = find_excluded_rule(text, config.get("excludedTexts", []))
        if matched_rule:
            return {
                "status": "skipped",
                "rule": matched_rule,
                "steps": [
                    {"status": "complete", "message": "Текст получен"},
                    {
                        "status": "skipped",
                        "message": f"Найдено исключение «{matched_rule}»",
                    },
                    {
                        "status": "skipped",
                        "message": "Не напечатан: текст соответствует исключению",
                    },
                ],
            }

        steps = [
            {"status": "complete", "message": "Текст получен"},
            {"status": "complete", "message": "Исключений не найдено"},
        ]
        printer_name = config.get("printer")
        if not printer_name:
            return {
                "status": "ignored",
                "steps": steps
                + [
                    {
                        "status": "blocked",
                        "message": "Не напечатан: принтер не выбран",
                    }
                ],
            }
        if not self.printer_service.is_online(printer_name):
            return {
                "status": "ignored",
                "steps": steps
                + [
                    {
                        "status": "blocked",
                        "message": "Не напечатан: принтер недоступен",
                    }
                ],
            }

        steps.append({"status": "complete", "message": "Принтер доступен"})
        self.printer_service.print_number(text, config)
        return {
            "status": "printed",
            "steps": steps
            + [{"status": "complete", "message": "Отправлен на печать"}],
        }
