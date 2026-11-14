"""Ленивая загрузка пользовательских шрифтов без регистрации в Windows."""

import os
import re
from contextlib import contextmanager
from io import BytesIO
from pathlib import Path
from threading import RLock

from fontTools.ttLib import TTFont


APP_NAME = "PrintNum"
APPDATA_DIR = Path(
    os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming")
)
FONTS_DIR = APPDATA_DIR / APP_NAME / "fonts"

# Общая блокировка ресурсов используется также backgrounds.py.
resource_lock = RLock()

_font_cache = {}


def _normalize_font_name(name):
    return re.sub(r"[^a-z0-9]", "", str(name).casefold())


def _get_file_signature(path):
    try:
        stat = path.stat()
        return stat.st_mtime_ns, stat.st_size
    except OSError:
        return None


def _get_font_family(data, filename):
    """Определяет название семейства шрифта из его метаданных."""
    try:
        font = TTFont(BytesIO(data), lazy=True)
        try:
            names = font["name"].names
            for name_id in (16, 1):
                records = [item for item in names if item.nameID == name_id]
                records.sort(
                    key=lambda item: (
                        item.platformID not in (0, 3),
                        item.langID != 0x409,
                    )
                )
                for record in records:
                    try:
                        family = record.toUnicode().strip()
                        if family:
                            return family
                    except Exception:
                        continue
        finally:
            font.close()
    except Exception as error:
        print(f"[Предупреждение] Не удалось прочитать имя {filename}: {error}")

    return Path(filename).stem


def _find_font_file(font_name):
    """Находит файл по имени семейства, не загружая шрифты в кеш."""
    if not FONTS_DIR.is_dir():
        return None

    requested = _normalize_font_name(Path(font_name).stem)
    try:
        candidates = sorted(
            path for path in FONTS_DIR.iterdir()
            if path.is_file() and path.suffix.lower() in (".ttf", ".otf")
        )
    except OSError as error:
        print(f"[Ошибка чтения папки шрифтов]: {error}")
        return None

    # Имя файла — быстрый путь без чтения содержимого остальных шрифтов.
    for path in candidates:
        if _normalize_font_name(path.stem) == requested:
            return path

    # Имя семейства известно только из метаданных файла.
    for path in candidates:
        try:
            data = path.read_bytes()
            if _normalize_font_name(_get_font_family(data, path.name)) == requested:
                return path
        except OSError:
            continue

    return None


def load_font(font_name):
    """Загружает в память только запрошенный шрифт (по имени файла или семьи)."""
    if not isinstance(font_name, str) or not font_name.strip():
        return None

    font_name = font_name.strip()
    if _normalize_font_name(font_name) == "arial":
        return None

    with resource_lock:
        path = _find_font_file(font_name)
        if path is None:
            return None

        signature = _get_file_signature(path)
        cached = _font_cache.get(path.name)
        if cached and cached["signature"] == signature:
            return cached

        try:
            data = path.read_bytes()
            family = _get_font_family(data, path.name)
            # Проверяем, что FreeType действительно может открыть файл.
            from PIL import ImageFont
            ImageFont.truetype(BytesIO(data), size=12)

            font = {
                "data": data,
                "family": family,
                "filename": path.name,
                "signature": _get_file_signature(path),
            }
        except Exception as error:
            # Не затираем предыдущую рабочую версию кеша.
            print(f"[Ошибка загрузки шрифта {path.name}]: {error}")
            return cached

        _font_cache[path.name] = font
        print(f"[Шрифт] Загружен в память: {path.name} → {family}")
        return font


def get_font_name(font_name=None):
    """Возвращает семейство выбранного шрифта или Arial."""
    font = load_font(font_name)
    return font["family"] if font else "Arial"


def init_fonts(force=False):
    """Совместимый no-op: шрифты загружаются только через load_font()."""
    return None


def shutdown_fonts():
    """Освобождает только оперативный кеш."""
    with resource_lock:
        _font_cache.clear()


@contextmanager
def resource_session():
    """Не допускает очистку кеша ресурсов во время печати."""
    with resource_lock:
        yield _font_cache
