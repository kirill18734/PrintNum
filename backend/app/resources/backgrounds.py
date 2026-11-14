"""Чтение и кеширование фоновых изображений."""

import os
from pathlib import Path
from threading import RLock


APP_NAME = "PrintNum"
APPDATA_DIR = os.environ.get("APPDATA")
APPDATA_ROOT = (
    Path(APPDATA_DIR) / APP_NAME
    if APPDATA_DIR
    else Path.home() / "AppData" / "Roaming" / APP_NAME
)
BACKGROUNDS_DIR = APPDATA_ROOT / "backgrounds"

resource_lock = RLock()
_background_cache = {}
_initialized = False


def _get_file_signature(path):
    try:
        stat = path.stat()
        return stat.st_mtime_ns, stat.st_size
    except OSError:
        return None


def _load_background_file(path):
    """Читает изображение в оперативную память без изменения оригинала."""

    try:
        data = path.read_bytes()

        _background_cache[path.name] = {
            "data": data,
            "signature": _get_file_signature(path),
        }

        print(f"[Фон] Загружен: {path.name}")

    except OSError as error:
        print(f"[Ошибка загрузки фона {path.name}]: {error}")


def init_backgrounds(force=False):
    """Загружает фоновые изображения в оперативную память."""

    global _initialized

    with resource_lock:
        if _initialized and not force:
            return

        if force:
            clear_backgrounds()

        try:
            image_files = sorted(
                path for path in BACKGROUNDS_DIR.iterdir()
                if path.is_file()
            )

            for path in image_files:
                _load_background_file(path)

        except OSError as error:
            print(f"[Ошибка чтения папки фонов]: {error}")

        _initialized = True


def clear_backgrounds():
    """Очищает кеш фоновых изображений."""

    global _initialized

    with resource_lock:
        _background_cache.clear()
        _initialized = False


def get_background(filename):
    """Возвращает байты ранее загруженного фонового изображения."""

    if not isinstance(filename, str) or not filename:
        return None

    if Path(filename).name != filename:
        return None

    with resource_lock:
        if not _initialized:
            init_backgrounds()

        background = _background_cache.get(filename)
        return background["data"] if background else None


def is_initialized():
    with resource_lock:
        return _initialized
