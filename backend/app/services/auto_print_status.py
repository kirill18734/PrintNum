"""Потокобезопасно хранит результат обработки последнего задания автопечати."""

from copy import deepcopy
from threading import Lock
import time


class AutoPrintStatus:
    def __init__(self):
        self._lock = Lock()
        self._latest = None
        self._next_id = 0

    def start(self, text):
        with self._lock:
            self._next_id += 1
            event = {
                "id": self._next_id,
                "text": text,
                "receivedAt": int(time.time() * 1000),
                "status": "processing",
                "steps": [
                    {"status": "complete", "message": "Текст получен"},
                    {"status": "pending", "message": "Обработка задания"},
                ],
            }
            self._latest = event
            return event["id"]

    def finish(self, event_id, result):
        with self._lock:
            if self._latest and self._latest["id"] == event_id:
                self._latest["status"] = result["status"]
                self._latest["steps"] = deepcopy(result["steps"])

    def fail(self, event_id):
        self.finish(
            event_id,
            {
                "status": "error",
                "steps": [
                    {"status": "complete", "message": "Текст получен"},
                    {"status": "error", "message": "Ошибка обработки задания"},
                ],
            },
        )

    def latest(self):
        with self._lock:
            return deepcopy(self._latest)
