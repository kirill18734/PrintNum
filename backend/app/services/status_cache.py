"""Потокобезопасный кэш статуса принтера из UI-опроса или проверки перед печатью."""

from threading import Lock
from typing import Optional
import time


class PrinterStatusCache:
    def __init__(self) -> None:
        self._lock = Lock()
        self._last_status: Optional[bool] = None
        self._last_update_ms: Optional[int] = None

    def set(self, online: bool) -> None:
        with self._lock:
            self._last_status = bool(online)
            self._last_update_ms = int(time.time() * 1000)

    def get(self) -> Optional[bool]:
        with self._lock:
            return self._last_status

    def last_updated_at(self) -> Optional[int]:
        with self._lock:
            return self._last_update_ms


__all__ = ["PrinterStatusCache"]
