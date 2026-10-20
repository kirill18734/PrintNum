"""Отслеживает активность бэкенда и запускает штатную остановку по таймауту или запросу."""

import threading
import time


class RuntimeActivity:
    """Tracks recent HTTP activity and requests a graceful server shutdown."""

    def __init__(self, idle_timeout=10):
        self.idle_timeout = idle_timeout
        self._last_activity = time.monotonic()
        self._active_requests = 0
        self._lock = threading.Lock()
        self._stopping = threading.Event()
        self._shutdown_requested = threading.Event()

    def begin_request(self):
        with self._lock:
            self._last_activity = time.monotonic()
            self._active_requests += 1

    def end_request(self):
        with self._lock:
            self._last_activity = time.monotonic()
            self._active_requests = max(0, self._active_requests - 1)

    def stop(self):
        self._stopping.set()

    def request_shutdown(self):
        self._shutdown_requested.set()

    def watch(self, shutdown, poll_interval=1):
        while not self._stopping.wait(poll_interval):
            if self._shutdown_requested.is_set():
                shutdown()
                return
            with self._lock:
                idle_for = time.monotonic() - self._last_activity
                has_active_requests = self._active_requests > 0
            if not has_active_requests and idle_for > self.idle_timeout:
                shutdown()
                return
