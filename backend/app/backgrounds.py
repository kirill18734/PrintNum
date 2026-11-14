"""Ленивая загрузка фоновых изображений только по запросу."""

from pathlib import Path

from app.fonts import APPDATA_DIR, APP_NAME, resource_lock


BACKGROUNDS_DIR = APPDATA_DIR / APP_NAME / "backgrounds"
_image_cache = {}


def get_image(filename):
    """Возвращает байты фона, загружая только запрошенный файл."""
    if not isinstance(filename, str) or not filename:
        return None
    if Path(filename).name != filename:
        return None

    path = BACKGROUNDS_DIR / filename
    with resource_lock:
        try:
            stat = path.stat()
            if not path.is_file():
                return None
            signature = (stat.st_mtime_ns, stat.st_size)
        except OSError:
            return None

        cached = _image_cache.get(filename)
        if cached and cached["signature"] == signature:
            return cached["data"]

        try:
            data = path.read_bytes()
            # Проверяем, что файл действительно является изображением.
            from PIL import Image
            from io import BytesIO
            with Image.open(BytesIO(data)) as image:
                image.verify()
            current = path.stat()
            _image_cache[filename] = {
                "data": data,
                "signature": (current.st_mtime_ns, current.st_size),
            }
            return data
        except Exception as error:
            # Повреждённая новая версия не затирает прежнюю запись.
            print(f"[Ошибка загрузки фона {filename}]: {error}")
            return cached["data"] if cached else None


def init_backgrounds(force=False):
    """Совместимый no-op: фоны читаются только через get_image()."""
    return None


def shutdown_backgrounds():
    """Освобождает кеш изображений в оперативной памяти."""
    with resource_lock:
        _image_cache.clear()
