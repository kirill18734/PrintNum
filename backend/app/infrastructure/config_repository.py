"""Потокобезопасное кешируемое чтение настроек, общих с настольным приложением."""

import json
import logging
import os
from pathlib import Path
from threading import RLock


logger = logging.getLogger(__name__)


def default_config_path():
    base_dir = Path(os.environ.get("APPDATA", Path(__file__).resolve().parents[2]))
    return base_dir / "PrintNum" / "config.json"


class ConfigRepository:
    """Thread-safe, mtime-cached access to the Tauri-owned settings file."""

    def __init__(self, path=None):
        self.path = Path(path) if path is not None else default_config_path()
        self._lock = RLock()
        self._mtime_ns = None
        self._config = {}

    def load(self):
        with self._lock:
            try:
                stat = self.path.stat()
            except FileNotFoundError:
                self._mtime_ns = None
                self._config = {}
                return {}
            except OSError:
                logger.exception("Не удалось проверить файл настроек %s", self.path)
                return self._config.copy()

            if stat.st_mtime_ns == self._mtime_ns:
                return self._config.copy()

            try:
                with self.path.open("r", encoding="utf-8") as config_file:
                    loaded = json.load(config_file)
                if not isinstance(loaded, dict):
                    raise ValueError("Корнем файла настроек должен быть JSON-объект")
            except (OSError, json.JSONDecodeError, ValueError):
                logger.exception("Не удалось прочитать настройки из %s", self.path)
                return self._config.copy()

            self._config = loaded
            self._mtime_ns = stat.st_mtime_ns
            return self._config.copy()
