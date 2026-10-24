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
            steps = [
                {"stage": "received", "status": "complete", "message": "Текст получен"}
            ]
            if print_text is not None and print_text != text:
                steps.append(
                    {
                        "stage": "received",
                        "status": "complete",
                        "message": f"Переименовано в {print_text}",
                    }
                )
            steps.append(
                {"stage": "result", "status": "pending", "message": "Обработка задания"}
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

    def _is_processing(self, event_id):
        return (
            self._latest is not None
            and self._latest["id"] == event_id
            and self._latest["status"] == "processing"
        )

    def progress(self, event_id, steps):
        with self._lock:
            if not self._is_processing(event_id):
                return
            self._latest["steps"] = deepcopy(steps)
            if not any(step.get("stage") == "result" for step in steps):
                self._latest["steps"].append(
                    {
                        "stage": "result",
                        "status": "pending",
                        "message": "Обработка задания",
                    }
                )

    def finish(self, event_id, result):
        with self._lock:
            if self._is_processing(event_id):
                self._latest["status"] = result["status"]
                self._latest["steps"] = deepcopy(result["steps"])

    def fail(self, event_id):
        with self._lock:
            if not self._is_processing(event_id):
                return
            steps = [
                step
                for step in self._latest["steps"]
                if step["status"] == "complete" and step.get("stage") != "result"
            ]
            self._latest["status"] = "error"
            self._latest["steps"] = steps + [
                {
                    "stage": "result",
                    "status": "error",
                    "message": "Ошибка обработки задания",
                }
            ]

    def latest(self):
        with self._lock:
            return deepcopy(self._latest)
