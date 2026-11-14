"""Подготовка и кеширование готовых фоновых изображений для печати."""

import math
import os
from pathlib import Path
from threading import RLock
from io import BytesIO

from PIL import Image, ImageOps, ImageWin


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
MAX_BACKGROUND_PIXELS = 40_000_000
SUPPORTED_BACKGROUND_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}


def _get_file_signature(path):
    try:
        stat = path.stat()
        return stat.st_mtime_ns, stat.st_size
    except OSError:
        return None


def _find_background_file(name):
    """Находит фоновое изображение по имени без расширения."""
    if not isinstance(name, str) or not name.strip():
        return None

    name = name.strip()
    if name in {".", ".."} or Path(name).name != name:
        return None

    # В конфигурации хранится только имя ресурса, без расширения.
    if Path(name).suffix.lower() in SUPPORTED_BACKGROUND_EXTENSIONS:
        return None

    try:
        matches = [
            path
            for path in BACKGROUNDS_DIR.iterdir()
            if path.is_file()
            and path.suffix.lower() in SUPPORTED_BACKGROUND_EXTENSIONS
            and path.stem.casefold() == name.casefold()
        ]
    except OSError:
        return None

    # Не выбираем файл наугад, если одинаковое имя есть в разных форматах.
    return matches[0] if len(matches) == 1 else None


def _normalize_opacity(value):
    if isinstance(value, bool):
        return 100
    try:
        opacity = float(value)
        if not math.isfinite(opacity):
            return 100
        return max(1, min(100, int(opacity)))
    except (TypeError, ValueError, OverflowError):
        return 100


def init_backgrounds(force=False):
    """Инициализирует модуль; файлы загружаются лениво по запросу."""
    global _initialized
    with resource_lock:
        if force:
            _background_cache.clear()
        _initialized = True


def clear_backgrounds():
    """Очищает кеш подготовленных фоновых изображений."""
    global _initialized
    with resource_lock:
        _background_cache.clear()
        _initialized = False


def _prepare_image(data, opacity, size):
    """Создаёт готовое RGB-изображение, смешанное с белой бумагой."""
    with Image.open(BytesIO(data)) as source:
        if (
            source.width <= 0
            or source.height <= 0
            or source.width * source.height > MAX_BACKGROUND_PIXELS
        ):
            raise ValueError("Фоновое изображение слишком большое")
        source.load()
        image = source.convert("RGBA")

    image = ImageOps.fit(
        image,
        size,
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )

    if opacity < 100:
        alpha = image.getchannel("A")
        alpha = alpha.point(lambda value: value * opacity // 100)
        image.putalpha(alpha)

    # GDI DIB не всегда корректно обрабатывает альфа-канал.
    # Заранее смешиваем фон с белой бумагой и кешируем RGB.
    paper = Image.new("RGBA", size, (255, 255, 255, 255))
    paper.alpha_composite(image)
    return paper.convert("RGB")


def get_prepared_background(filename, opacity=100, size=None):
    """Возвращает готовое к печати изображение из RAM-кеша."""
    path = _find_background_file(filename)
    if path is None:
        return None

    filename = path.name

    if (
        not isinstance(size, (tuple, list))
        or len(size) != 2
        or any(not isinstance(value, int) or value <= 0 for value in size)
    ):
        return None

    opacity = _normalize_opacity(opacity)
    size = (size[0], size[1])

    with resource_lock:
        signature = _get_file_signature(path)
        if signature is None:
            for key in list(_background_cache):
                if key[0] == filename:
                    _background_cache.pop(key, None)
            return None

        key = (filename, signature, opacity, size)
        cached = _background_cache.get(key)
        if cached is not None:
            return cached

        # Удаляем устаревшие варианты этого же файла.
        for old_key in list(_background_cache):
            if old_key[0] == filename and old_key != key:
                _background_cache.pop(old_key, None)

        try:
            data = path.read_bytes()
            after_read = _get_file_signature(path)
            if after_read != signature:
                if after_read is None:
                    return None
                data = path.read_bytes()
                if _get_file_signature(path) != after_read:
                    print(f"[Фон] Файл изменяется во время чтения: {filename}")
                    return None
                signature = after_read
                key = (filename, signature, opacity, size)

            prepared = _prepare_image(data, opacity, size)
            _background_cache[key] = prepared
            print(
                f"[Фон] Подготовлен: {filename}, "
                f"opacity={opacity}%, размер={size[0]}x{size[1]}"
            )
            return prepared
        except Exception as error:
            print(f"[Ошибка подготовки фона {filename}]: {error}")
            return None


def draw_background(hdc, sizes, filename, opacity=100):
    """Рисует готовый фон на всю этикетку перед отрисовкой текста."""
    prepared = get_prepared_background(
        filename,
        opacity,
        (sizes["width_px"], sizes["height_px"]),
    )
    if prepared is None:
        return False

    try:
        ImageWin.Dib(prepared).draw(
            hdc.GetHandleOutput(),
            (0, 0, sizes["width_px"], sizes["height_px"]),
        )
        return True
    except Exception as error:
        print(f"[Ошибка отрисовки фона {filename}]: {error}")
        return False


def get_background(filename):
    """Возвращает исходные байты фона по имени без расширения."""
    path = _find_background_file(filename)
    if path is None:
        return None

    with resource_lock:
        if _get_file_signature(path) is None:
            return None
        try:
            return path.read_bytes()
        except OSError:
            return None


def is_initialized():
    with resource_lock:
        return _initialized
