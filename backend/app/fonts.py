"""Загрузка, регистрация и кеширование пользовательских шрифтов."""

import ctypes
import os
import re

from contextlib import contextmanager
from ctypes import wintypes
from io import BytesIO
from pathlib import Path
from threading import RLock


APP_NAME = "PrintNum"
APPDATA_DIR = Path(
    os.environ.get(
        "APPDATA",
        Path.home() / "AppData" / "Roaming",
    )
)
FONTS_DIR = APPDATA_DIR / APP_NAME / "fonts"

# Общая блокировка ресурсов используется также backgrounds.py.
resource_lock = RLock()

_font_cache = {
    "fonts": {},
    "font_names": {},
    "initialized": False,
}


if os.name == "nt":
    gdi32 = ctypes.WinDLL("gdi32", use_last_error=True)

    _add_font_mem = gdi32.AddFontMemResourceEx
    _add_font_mem.argtypes = [
        ctypes.c_void_p,
        wintypes.DWORD,
        ctypes.c_void_p,
        ctypes.POINTER(wintypes.DWORD),
    ]
    _add_font_mem.restype = wintypes.HANDLE

    _remove_font_mem = gdi32.RemoveFontMemResourceEx
    _remove_font_mem.argtypes = [wintypes.HANDLE]
    _remove_font_mem.restype = wintypes.BOOL


def _normalize_font_name(name):
    return re.sub(r"[^a-z0-9]", "", name.casefold())


def _get_file_signature(path):
    try:
        stat = path.stat()
        return stat.st_mtime_ns, stat.st_size
    except OSError:
        return None


def _get_font_family(data, filename):
    """Определяет название семейства шрифта."""
    try:
        from fontTools.ttLib import TTFont

        font = TTFont(BytesIO(data), lazy=True)

        try:
            name_table = font["name"]

            for name_id in (16, 1):
                records = [
                    record
                    for record in name_table.names
                    if record.nameID == name_id
                ]
                records.sort(
                    key=lambda record: (
                        record.platformID not in (0, 3),
                        record.langID != 0x409,
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
        print(
            f"[Предупреждение] Ошибка чтения "
            f"метаданных {filename}: {error}"
        )

    return Path(filename).stem


def _register_font(data):
    """Регистрирует шрифт непосредственно из памяти."""
    if os.name != "nt":
        return None, None

    buffer = ctypes.create_string_buffer(data)
    font_count = wintypes.DWORD(0)

    handle = _add_font_mem(
        ctypes.cast(buffer, ctypes.c_void_p),
        len(data),
        None,
        ctypes.byref(font_count),
    )

    if not handle:
        raise OSError(
            f"Ошибка регистрации шрифта: {ctypes.get_last_error()}"
        )

    return handle, buffer


def _unregister_font(font):
    handle = font.get("handle")

    if handle and os.name == "nt":
        if not _remove_font_mem(handle):
            print("[Ошибка] Не удалось освободить шрифт")


def _load_font_file(path):
    """Читает и регистрирует один шрифт."""
    filename = path.name

    try:
        data = path.read_bytes()
        handle, buffer = _register_font(data)
        family = _get_font_family(data, filename)

        font = {
            "data": data,
            "family": family,
            "handle": handle,
            "buffer": buffer,
            "signature": _get_file_signature(path),
        }

        _font_cache["fonts"][filename] = font
        _font_cache["font_names"][
            _normalize_font_name(Path(filename).stem)
        ] = filename
        _font_cache["font_names"][
            _normalize_font_name(family)
        ] = filename

        print(f"[Шрифт] Загружен: {filename} → {family}")

    except Exception as error:
        print(f"[Ошибка загрузки шрифта {filename}]: {error}")


def init_fonts(force=False):
    """Создаёт каталог шрифтов и загружает шрифты в кеш."""
    with resource_lock:
        if _font_cache["initialized"] and not force:
            return

        if force:
            _clear_fonts()

        FONTS_DIR.mkdir(parents=True, exist_ok=True)
        print("[Шрифты] Начало загрузки...")

        try:
            font_files = sorted(
                path for path in FONTS_DIR.iterdir()
                if path.is_file()
                and path.suffix.lower() in (".ttf", ".otf")
            )
            for path in font_files:
                _load_font_file(path)
        except OSError as error:
            print(f"[Ошибка чтения папки шрифтов]: {error}")

        _font_cache["initialized"] = True
        print(
            f"[Шрифты] Загрузка завершена. "
            f"Загружено: {len(_font_cache['fonts'])}"
        )


def _clear_fonts():
    """Освобождает зарегистрированные шрифты и очищает кеш."""
    for font in _font_cache["fonts"].values():
        _unregister_font(font)

    _font_cache["fonts"].clear()
    _font_cache["font_names"].clear()
    _font_cache["initialized"] = False


def shutdown_fonts():
    """Освобождает шрифты при завершении приложения."""
    with resource_lock:
        _clear_fonts()


def load_font(filename):
    """Возвращает уже загруженный шрифт."""
    with resource_lock:
        if not _font_cache["initialized"]:
            init_fonts()

        return _font_cache["fonts"].get(filename)


def get_font_name(font_name=None):
    """Возвращает настоящее название семейства шрифта."""
    if not isinstance(font_name, str) or not font_name.strip():
        return "Arial"

    font_name = font_name.strip()
    if _normalize_font_name(font_name) == "arial":
        return "Arial"

    with resource_lock:
        if not _font_cache["initialized"]:
            init_fonts()

        requested = _normalize_font_name(Path(font_name).stem)
        filename = _font_cache["font_names"].get(requested)

        if filename is None:
            print(
                f"[Шрифт] '{font_name}' не найден. "
                "Используется Arial."
            )
            return "Arial"

        font = _font_cache["fonts"].get(filename)
        return font["family"] if font else "Arial"


@contextmanager
def resource_session():
    """Защищает шрифты и фоны от очистки во время печати."""
    with resource_lock:
        if not _font_cache["initialized"]:
            init_fonts()

        yield _font_cache
