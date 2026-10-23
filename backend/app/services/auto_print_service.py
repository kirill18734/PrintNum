"""Обрабатывает автопечать и применяет правила исключения текста."""

from app.domain.filter_rules import find_excluded_rule


class AutoPrintService:
    def __init__(
        self, config_repository, printer_service, status_cache, refresh_status_before_print=False
    ):
        self.config_repository = config_repository
        self.printer_service = printer_service
        self.status_cache = status_cache
        self.refresh_status_before_print = refresh_status_before_print

    def process(self, text, print_text=None):
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
        ]
        if print_text is not None and print_text != text:
            steps.append(
                {
                    "status": "complete",
                    "message": f"Переименовано в {print_text}",
                }
            )
        steps.append({"status": "complete", "message": "Исключений не найдено"})
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
        cached_status = self.status_cache.get()
        if self.refresh_status_before_print or cached_status is None:
            is_online = self.printer_service.is_online(printer_name)
            if self.refresh_status_before_print:
                self.status_cache.set(is_online)
        else:
            is_online = cached_status

        if not is_online:
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
        output_text = print_text if print_text is not None else text
        self.printer_service.print_number(output_text, config)
        return {
            "status": "printed",
            "steps": steps
            + [
                {
                    "status": "complete",
                    "message": (
                        f"Отправлен на печать: {output_text}"
                        if print_text is not None
                        else "Отправлен на печать"
                    ),
                }
            ],
        }
