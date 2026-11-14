"""Загрузка и кеширование фоновых изображений."""

from pathlib import Path

from app.fonts import APPDATA_DIR, APP_NAME, resource_lock


BACKGROUNDS_DIR = APPDATA_DIR / APP_NAME / "backgrounds"

_image_cache = {
    "images": {},
    "initialized": False,
}


def _load_image_file(path):
    """Читает изображение в оперативную память."""
    try:
        data = path.read_bytes()
        stat = path.stat()

        _image_cache["images"][path.name] = {
            "data": data,
            "signature": (stat.st_mtime_ns, stat.st_size),
        }

        print(f"[Фон] Загружен: {path.name}")

    except OSError as error:
        print(f"[Ошибка загрузки фона {path.name}]: {error}")


def init_backgrounds(force=False):
    """Создаёт каталог фонов и загружает изображения в кеш."""
    with resource_lock:
        if _image_cache["initialized"] and not force:
            return

        if force:
            _image_cache["images"].clear()

        BACKGROUNDS_DIR.mkdir(parents=True, exist_ok=True)
        print("[Фоны] Начало загрузки...")

        try:
            image_files = sorted(
                path for path in BACKGROUNDS_DIR.iterdir()
                if path.is_file()
            )
            for path in image_files:
                _load_image_file(path)
        except OSError as error:
            print(f"[Ошибка чтения папки фонов]: {error}")

        _image_cache["initialized"] = True
        print(
            f"[Фоны] Загрузка завершена. "
            f"Загружено: {len(_image_cache['images'])}"
        )


def get_image(filename):
    """Возвращает байты фонового изображения из кеша."""
    if not isinstance(filename, str) or not filename:
        return None

    if Path(filename).name != filename:
        return None

    with resource_lock:
        if not _image_cache["initialized"]:
            init_backgrounds()

        image = _image_cache["images"].get(filename)
        return image["data"] if image else None


def shutdown_backgrounds():
    """Очищает кеш изображений при завершении приложения."""
    with resource_lock:
        _image_cache["images"].clear()
        _image_cache["initialized"] = False
