"""Потокобезопасно хранит результат обработки последнего задания автопечати."""

from copy import deepcopy
from threading import Lock
import time


class AutoPrintStatus:
    def __init__(self):
        self._lock = Lock()
        self._latest = None
        self._next_id = 0

    def start(self, text, print_text=None):
        with self._lock:
            self._next_id += 1
            steps = [{"status": "complete", "message": "Текст получен"}]
            if print_text is not None and print_text != text:
                steps.append(
                    {
                        "status": "complete",
                        "message": f"Переименовано в {print_text}",
                    }
                )
            steps.append(
                {"status": "pending", "message": "Обработка задания"}
            )
            event = {
                "id": self._next_id,
                "text": text,
                "receivedAt": int(time.time() * 1000),
                "status": "processing",
                "steps": steps,
            }
            self._latest = event
            return event["id"]

    def finish(self, event_id, result):
        with self._lock:
            if self._latest and self._latest["id"] == event_id:
                self._latest["status"] = result["status"]
                self._latest["steps"] = deepcopy(result["steps"])

    def fail(self, event_id):
        with self._lock:
            if not self._latest or self._latest["id"] != event_id:
                return
            steps = [
                step
                for step in self._latest["steps"]
                if step["status"] == "complete"
            ]
        self.finish(
            event_id,
            {
                "status": "error",
                "steps": steps
                + [{"status": "error", "message": "Ошибка обработки задания"}],
            },
        )

    def latest(self):
        with self._lock:
            return deepcopy(self._latest)
