# app/resources.py

import os
import re
import ctypes

from io import BytesIO
from pathlib import Path
from threading import RLock
from contextlib import contextmanager
from ctypes import wintypes


# ============================================================
# PATHS
# ============================================================

APP_NAME = "PrintNum"

APPDATA_DIR = os.environ.get("APPDATA")

APPDATA_ROOT = (
    Path(APPDATA_DIR) / APP_NAME
    if APPDATA_DIR
    else Path.home() / "AppData" / "Roaming" / APP_NAME
)

FONTS_DIR = APPDATA_ROOT / "fonts"
IMAGES_DIR = APPDATA_ROOT / "backgrounds"


# ============================================================
# CACHE
# ============================================================

resource_lock = RLock()

_resource_cache = {
    "fonts": {},
    "images": {},
    "font_names": {},
    "initialized": False,
}


# ============================================================
# WINDOWS FONT API
# ============================================================

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


# ============================================================
# HELPERS
# ============================================================

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


# ============================================================
# FONT REGISTRATION
# ============================================================

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
            f"Ошибка регистрации шрифта: "
            f"{ctypes.get_last_error()}"
        )

    return handle, buffer


def _unregister_font(font):
    handle = font.get("handle")

    if handle and os.name == "nt":
        if not _remove_font_mem(handle):
            print("[Ошибка] Не удалось освободить шрифт")


# ============================================================
# LOAD FONT
# ============================================================

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

        _resource_cache["fonts"][filename] = font

        # Индексируем и имя файла, и семейство.
        _resource_cache["font_names"][
            _normalize_font_name(Path(filename).stem)
        ] = filename

        _resource_cache["font_names"][
            _normalize_font_name(family)
        ] = filename

        print(f"[Шрифт] Загружен: {filename} → {family}")

    except Exception as error:
        print(f"[Ошибка загрузки шрифта {filename}]: {error}")


# ============================================================
# LOAD IMAGE
# ============================================================

def _load_image_file(path):
    """Читает изображение в оперативную память."""

    try:
        data = path.read_bytes()

        _resource_cache["images"][path.name] = {
            "data": data,
            "signature": _get_file_signature(path),
        }

        print(f"[Изображение] Загружено: {path.name}")

    except OSError as error:
        print(
            f"[Ошибка загрузки изображения {path.name}]: {error}"
        )


# ============================================================
# INITIALIZE RESOURCES
# ============================================================

def init_resources(force=False):
    """
    Загружает все шрифты и изображения в кеш.

    Вызывается при запуске приложения.
    Повторный вызов ничего не делает,
    если кеш уже инициализирован.
    """

    with resource_lock:

        if _resource_cache["initialized"] and not force:
            return

        if force:
            _clear_resources()

        print("[Ресурсы] Начало загрузки...")

        # Загружаем все шрифты.
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

        # Загружаем все изображения.
        try:
            image_files = sorted(
                path for path in IMAGES_DIR.iterdir()
                if path.is_file()
            )

            for path in image_files:
                _load_image_file(path)

        except OSError as error:
            print(f"[Ошибка чтения папки изображений]: {error}")

        _resource_cache["initialized"] = True

        print(
            f"[Ресурсы] Загрузка завершена. "
            f"Шрифтов: {len(_resource_cache['fonts'])}, "
            f"изображений: {len(_resource_cache['images'])}"
        )


# ============================================================
# CLEAR CACHE
# ============================================================

def _clear_resources():
    """Освобождает все загруженные ресурсы."""

    for font in _resource_cache["fonts"].values():
        _unregister_font(font)

    _resource_cache["fonts"].clear()
    _resource_cache["images"].clear()
    _resource_cache["font_names"].clear()

    _resource_cache["initialized"] = False


def shutdown_resources():
    """Освобождает ресурсы при завершении приложения."""

    with resource_lock:
        _clear_resources()


# ============================================================
# FONT ACCESS
# ============================================================

def load_font(filename):
    """Возвращает уже загруженный шрифт."""

    with resource_lock:

        if not _resource_cache["initialized"]:
            init_resources()

        return _resource_cache["fonts"].get(filename)


def get_font_name(font_name=None):
    """Возвращает настоящее название семейства шрифта."""

    if not isinstance(font_name, str) or not font_name.strip():
        return "Arial"

    font_name = font_name.strip()

    if _normalize_font_name(font_name) == "arial":
        return "Arial"

    with resource_lock:

        if not _resource_cache["initialized"]:
            init_resources()

        requested = _normalize_font_name(
            Path(font_name).stem
        )

        filename = _resource_cache["font_names"].get(requested)

        if filename is None:
            print(
                f"[Шрифт] '{font_name}' не найден. "
                "Используется Arial."
            )
            return "Arial"

        font = _resource_cache["fonts"].get(filename)

        return font["family"] if font else "Arial"


# ============================================================
# IMAGE ACCESS
# ============================================================

def get_image(filename):
    """Возвращает байты изображения из кеша."""

    if not isinstance(filename, str) or not filename:
        return None

    if Path(filename).name != filename:
        return None

    with resource_lock:

        if not _resource_cache["initialized"]:
            init_resources()

        image = _resource_cache["images"].get(filename)

        return image["data"] if image else None


# ============================================================
# RESOURCE SESSION
# ============================================================

@contextmanager
def resource_session():
    """
    Защищает ресурсы от очистки во время печати.
    """

    with resource_lock:

        if not _resource_cache["initialized"]:
            init_resources()

        yield _resource_cache