"""Ленивая загрузка и безопасная регистрация пользовательских шрифтов в памяти."""
import ctypes
import os
from ctypes import wintypes
from io import BytesIO
from pathlib import Path
from threading import RLock

APP_NAME = "PrintNum"
APPDATA_DIR = os.environ.get("APPDATA")
APPDATA_ROOT = Path(APPDATA_DIR) / APP_NAME if APPDATA_DIR else Path.home() / "AppData" / "Roaming" / APP_NAME
FONTS_DIR = APPDATA_ROOT / "fonts"
SUPPORTED_EXTENSIONS = {".ttf", ".otf"}
resource_lock = RLock()
_font_cache = {}
_font_names = {}
_configured_slots = {}
_initialized = False

if os.name == "nt":
    gdi32 = ctypes.WinDLL("gdi32", use_last_error=True)
    _add_font_mem = gdi32.AddFontMemResourceEx
    _add_font_mem.argtypes = [ctypes.c_void_p, wintypes.DWORD, ctypes.c_void_p, ctypes.POINTER(wintypes.DWORD)]
    _add_font_mem.restype = wintypes.HANDLE
    _remove_font_mem = gdi32.RemoveFontMemResourceEx
    _remove_font_mem.argtypes = [wintypes.HANDLE]
    _remove_font_mem.restype = wintypes.BOOL


def _normalize_name(value):
    return str(value).strip().casefold()


def _get_file_signature(path):
    try:
        stat = path.stat()
        return stat.st_mtime_ns, stat.st_size
    except OSError:
        return None


def _find_font_file(name):
    if not isinstance(name, str) or not name.strip():
        return None, "Имя шрифта не задано"
    requested = name.strip()
    if requested in {".", ".."} or Path(requested).name != requested:
        return None, "Некорректное имя шрифта"
    if Path(requested).suffix.lower() in SUPPORTED_EXTENSIONS:
        return None, "В конфигурации указывается имя без расширения"
    try:
        matches = [
            path for path in FONTS_DIR.iterdir()
            if path.is_file()
            and path.suffix.lower() in SUPPORTED_EXTENSIONS
            and path.stem.casefold() == requested.casefold()
        ]
    except OSError as error:
        return None, f"Не удалось прочитать папку шрифтов: {error}"
    if not matches:
        return None, f"Файл шрифта '{requested}' не найден"
    if len(matches) > 1:
        return None, f"Имя шрифта '{requested}' неоднозначно"
    return matches[0], None


def _get_font_family(data, filename):
    try:
        from fontTools.ttLib import TTFont
        font = TTFont(BytesIO(data), lazy=True)
        try:
            names = font["name"].names
            for name_id in (16, 1):
                records = [item for item in names if item.nameID == name_id]
                records.sort(key=lambda item: (item.platformID not in (0, 3), item.langID != 0x409))
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


def _register_font(data):
    if os.name != "nt":
        return None, None
    buffer = ctypes.create_string_buffer(data)
    count = wintypes.DWORD(0)
    handle = _add_font_mem(ctypes.cast(buffer, ctypes.c_void_p), len(data), None, ctypes.byref(count))
    if not handle:
        raise OSError(f"AddFontMemResourceEx завершился ошибкой: {ctypes.get_last_error()}")
    return handle, buffer


def _unregister_font(font):
    handle = font.get("handle")
    if handle and os.name == "nt" and not _remove_font_mem(handle):
        print("[Шрифт] Не удалось освободить регистрацию шрифта")


def _remove_slot_reference(slot):
    old_key = _configured_slots.pop(slot, None)
    if old_key is None:
        return
    old_font = _font_cache.get(old_key)
    if old_font is None:
        return
    old_font["slots"].discard(slot)
    if not old_font["slots"]:
        _unregister_font(old_font)
        _font_cache.pop(old_key, None)
        for name, key in list(_font_names.items()):
            if key == old_key:
                _font_names.pop(name, None)


def _load_font(path, signature):
    key = (path.name.casefold(), signature)
    cached = _font_cache.get(key)
    if cached is not None:
        return key, cached
    data = path.read_bytes()
    if _get_file_signature(path) != signature:
        raise OSError("Файл шрифта изменился во время чтения")
    handle, buffer = _register_font(data)
    family = _get_font_family(data, path.name)
    font = {
        "filename": path.name, "data": data, "family": family,
        "handle": handle, "buffer": buffer, "signature": signature,
        "slots": set(),
    }
    _font_cache[key] = font
    _font_names[_normalize_name(Path(path.name).stem)] = key
    _font_names[_normalize_name(family)] = key
    print(f"[Шрифт] Загружен в память: {path.name} → {family}")
    return key, font


def get_configured_font_name(filename, slot):
    """Получает семейство для независимого слота auto/manual.

    Вызывается внутри resource_session(), удерживающей блокировку до конца
    печати: ресурс старой версии не снимается с регистрации во время GDI.
    """
    if slot not in {"auto", "manual", "legacy"}:
        raise ValueError("Неизвестный слот шрифта")
    with resource_lock:
        path, error = _find_font_file(filename)
        if error:
            _remove_slot_reference(slot)
            if filename:
                print(f"[Шрифт] {error}. Используется Arial.")
            return "Arial"
        signature = _get_file_signature(path)
        if signature is None:
            _remove_slot_reference(slot)
            print(f"[Шрифт] Не удалось получить файл {path.name}. Используется Arial.")
            return "Arial"
        try:
            key, font = _load_font(path, signature)
        except Exception as error:
            _remove_slot_reference(slot)
            print(f"[Ошибка загрузки шрифта {path.name}]: {error}. Используется Arial.")
            return "Arial"

        previous_key = _configured_slots.get(slot)
        if previous_key != key:
            font["slots"].add(slot)
            _configured_slots[slot] = key
            if previous_key is not None:
                old_font = _font_cache.get(previous_key)
                if old_font is not None:
                    old_font["slots"].discard(slot)
                    if not old_font["slots"]:
                        _unregister_font(old_font)
                        _font_cache.pop(previous_key, None)
                        for name, mapped_key in list(_font_names.items()):
                            if mapped_key == previous_key:
                                _font_names.pop(name, None)
        return font["family"]


def init_fonts(force=False):
    """Инициализирует менеджер; сами файлы читаются только по запросу."""
    global _initialized
    with resource_lock:
        if force:
            clear_fonts()
        _initialized = True


def clear_fonts():
    """Освобождает все зарегистрированные шрифты."""
    global _initialized
    with resource_lock:
        for font in list(_font_cache.values()):
            _unregister_font(font)
        _font_cache.clear()
        _font_names.clear()
        _configured_slots.clear()
        _initialized = False


def load_font(filename):
    """Совместимый доступ к уже загруженному файлу."""
    with resource_lock:
        for font in _font_cache.values():
            if font["filename"] == filename:
                return font
        return None


def get_font_name(font_name=None):
    """Совместимый API с отдельным legacy-слотом."""
    return get_configured_font_name(font_name, "legacy")


def is_initialized():
    with resource_lock:
        return _initialized
