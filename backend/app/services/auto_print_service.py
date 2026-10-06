"""Обрабатывает настройки автопечати, правила исключения, события и задания печати."""

import threading
import time
import uuid

from app.domain.filter_rules import find_excluded_rule


class SkippedPrintEvents:
    def __init__(self):
        self._lock = threading.Lock()
        self._last_event = None

    def record(self, rule, text):
        event = {
            "id": uuid.uuid4().hex,
            "rule": rule,
            "text": text,
            "timestamp": int(time.time() * 1000),
        }
        with self._lock:
            self._last_event = event
        return event.copy()

    def latest(self):
        with self._lock:
            return self._last_event.copy() if self._last_event else None


class AutoPrintService:
    def __init__(self, config_repository, printer_service, skipped_events):
        self.config_repository = config_repository
        self.printer_service = printer_service
        self.skipped_events = skipped_events

    def process(self, text):
        if not text:
            return {"status": "ignored"}

        config = self.config_repository.load()
        if not config.get("running"):
            return {"status": "ignored"}

        matched_rule = find_excluded_rule(text, config.get("excludedTexts", []))
        if matched_rule:
            self.skipped_events.record(matched_rule, text)
            return {"status": "skipped", "rule": matched_rule}

        if config.get("printer") and self.printer_service.is_online(
            config["printer"]
        ):
            self.printer_service.print_number(text, config)
            return {"status": "printed"}
        return {"status": "ignored"}
