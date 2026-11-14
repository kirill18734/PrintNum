import os
import re
import ctypes
import hashlib

from io import BytesIO
from pathlib import Path
from threading import RLock
from contextlib import contextmanager
from ctypes import wintypes

APP_NAME = "PrintNum"
LOCALAPPDATA_DIR = os.environ.get("LOCALAPPDATA")
RESOURCES_DIR = (
    Path(LOCALAPPDATA_DIR) / APP_NAME / "resources"
    if LOCALAPPDATA_DIR else Path.home() / APP_NAME / "resources"
)
FONTS_DIR = RESOURCES_DIR / "fonts"
IMAGES_DIR = RESOURCES_DIR / "images"

resource_lock = RLock()
_resource_cache = {
    "fonts": {},
    "images": {},
    "font_names": {},
    "initialized": False,
}

if os.name == "nt":
    gdi32 = ctypes.WinDLL("gdi32", use_last_error=True)
    _add_font_mem = gdi32.AddFontMemResourceEx
    _add_font_mem.argtypes = [
        ctypes.c_void_p, wintypes.DWORD, ctypes.c_void_p,
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


def _get_font_metadata(data, filename):
    """Извлекает CSS-семейство и начертание из метаданных TTF/OTF."""
    fallback_family = Path(filename).stem
    suffix = Path(filename).suffix.lower()
    metadata = {
        "family": fallback_family,
        "weight": 400,
        "fontStyle": "normal",
        "format": "opentype" if suffix == ".otf" else "truetype",
    }

    try:
        from fontTools.ttLib import TTFont
        font = TTFont(BytesIO(data), lazy=True)
        try:
            names = font["name"].names
            for name_id in (16, 1):
                records = [record for record in names if record.nameID == name_id]
                records.sort(key=lambda record: (
                    record.platformID not in (0, 3),
                    record.langID != 0x409,
                ))
                for record in records:
                    try:
                        value = record.toUnicode().strip()
                    except Exception:
                        continue
                    if value:
                        metadata["family"] = value
                        break
                if metadata["family"] != fallback_family:
                    break

            os2 = font.get("OS/2")
            head = font.get("head")
            italic_flag = False
            if os2 is not None:
                metadata["weight"] = min(
                    1000, max(1, int(getattr(os2, "usWeightClass", 400)))
                )
                italic_flag = bool(int(getattr(os2, "fsSelection", 0)) & 0x01)
            if head is not None:
                italic_flag = italic_flag or bool(
                    int(getattr(head, "macStyle", 0)) & 0x02
                )

            subfamily = ""
            for name_id in (17, 2):
                for record in names:
                    if record.nameID == name_id:
                        try:
                            subfamily = record.toUnicode().strip().casefold()
                        except Exception:
                            continue
                        if subfamily:
                            break
                if subfamily:
                    break

            metadata["fontStyle"] = (
                "italic"
                if italic_flag or "italic" in subfamily or "oblique" in subfamily
                else "normal"
            )
        finally:
            font.close()
    except Exception as error:
        print(f"[Предупреждение] Метаданные {filename} не прочитаны: {error}")

    metadata["id"] = hashlib.sha256(data).hexdigest()[:24]
    metadata["name"] = metadata["family"]
    return metadata


def _register_font(data):
    if os.name != "nt":
        return None, None
    buffer = ctypes.create_string_buffer(data)
    font_count = wintypes.DWORD(0)
    handle = _add_font_mem(
        ctypes.cast(buffer, ctypes.c_void_p), len(data), None,
        ctypes.byref(font_count),
    )
    if not handle:
        raise OSError(f"Ошибка регистрации шрифта: {ctypes.get_last_error()}")
    return handle, buffer


def _unregister_font(font):
    handle = font.get("handle")
    if handle and os.name == "nt" and not _remove_font_mem(handle):
        print("[Ошибка] Не удалось освободить шрифт")


def _load_font_file(path):
    filename = path.name
    try:
        data = path.read_bytes()
        metadata = _get_font_metadata(data, filename)
        handle, buffer = _register_font(data)
        _resource_cache["fonts"][filename] = {
            "data": data,
            "family": metadata["family"],
            "metadata": metadata,
            "handle": handle,
            "buffer": buffer,
            "signature": _get_file_signature(path),
        }
        _resource_cache["font_names"][_normalize_font_name(Path(filename).stem)] = filename
        _resource_cache["font_names"][_normalize_font_name(metadata["family"])] = filename
        print(
            f"[Шрифт] {filename} → {metadata['family']} "
            f"({metadata['weight']}, {metadata['fontStyle']})"
        )
    except Exception as error:
        print(f"[Ошибка загрузки шрифта {filename}]: {error}")


def _load_image_file(path):
    try:
        data = path.read_bytes()
        _resource_cache["images"][path.name] = {
            "data": data,
            "signature": _get_file_signature(path),
        }
        print(f"[Изображение] Загружено: {path.name}")
    except OSError as error:
        print(f"[Ошибка загрузки изображения {path.name}]: {error}")


def init_resources(force=False):
    """Загружает доступные шрифты и изображения в кеш при запуске."""
    with resource_lock:
        if _resource_cache["initialized"] and not force:
            return
        if force:
            _clear_resources()

        print("[Ресурсы] Начало загрузки...")
        try:
            for path in sorted(
                p for p in FONTS_DIR.iterdir()
                if p.is_file() and p.suffix.lower() in (".ttf", ".otf")
            ):
                _load_font_file(path)
        except OSError as error:
            print(f"[Ошибка чтения папки шрифтов]: {error}")

        try:
            for path in sorted(p for p in IMAGES_DIR.iterdir() if p.is_file()):
                _load_image_file(path)
        except OSError as error:
            print(f"[Ошибка чтения папки изображений]: {error}")

        _resource_cache["initialized"] = True
        print(
            f"[Ресурсы] Загружено шрифтов: {len(_resource_cache['fonts'])}, "
            f"изображений: {len(_resource_cache['images'])}"
        )


def _clear_resources():
    for font in _resource_cache["fonts"].values():
        _unregister_font(font)
    _resource_cache["fonts"].clear()
    _resource_cache["images"].clear()
    _resource_cache["font_names"].clear()
    _resource_cache["initialized"] = False


def shutdown_resources():
    with resource_lock:
        _clear_resources()


def load_font(filename):
    with resource_lock:
        if not _resource_cache["initialized"]:
            init_resources()
        return _resource_cache["fonts"].get(filename)


def get_font_name(font_name=None):
    if not isinstance(font_name, str) or not font_name.strip():
        return "Arial"
    font_name = font_name.strip()
    if _normalize_font_name(font_name) == "arial":
        return "Arial"
    with resource_lock:
        if not _resource_cache["initialized"]:
            init_resources()
        requested = _normalize_font_name(Path(font_name).stem)
        filename = _resource_cache["font_names"].get(requested)
        if filename is None:
            print(f"[Шрифт] '{font_name}' не найден. Используется Arial.")
            return "Arial"
        font = _resource_cache["fonts"].get(filename)
        return font["family"] if font else "Arial"


def get_fonts():
    """Возвращает метаданные шрифтов без передачи Base64 в частом polling."""
    with resource_lock:
        if not _resource_cache["initialized"]:
            init_resources()
        return [
            dict(font["metadata"])
            for _, font in sorted(_resource_cache["fonts"].items())
        ]


def get_font_data(font_id):
    """Возвращает бинарные данные по content-hash идентификатору."""
    if not isinstance(font_id, str) or not re.fullmatch(r"[a-f0-9]{24}", font_id):
        return None
    with resource_lock:
        if not _resource_cache["initialized"]:
            init_resources()
        for font in _resource_cache["fonts"].values():
            if font["metadata"]["id"] == font_id:
                return font["data"]
    return None


def get_images():
    """Возвращает доступные фоны и их данные."""
    with resource_lock:
        if not _resource_cache["initialized"]:
            init_resources()
        return [
            {"id": filename, "name": Path(filename).stem, "data": image["data"]}
            for filename, image in sorted(_resource_cache["images"].items())
        ]


def get_image(filename):
    if not isinstance(filename, str) or not filename or Path(filename).name != filename:
        return None
    with resource_lock:
        if not _resource_cache["initialized"]:
            init_resources()
        image = _resource_cache["images"].get(filename)
        return image["data"] if image else None


@contextmanager
def resource_session():
    """Защищает ресурсы от очистки во время печати."""
    with resource_lock:
        if not _resource_cache["initialized"]:
            init_resources()
        yield _resource_cache
