"""Совместимый фасад для работы с ресурсами PrintNum."""

from contextlib import contextmanager, ExitStack

from . import backgrounds, fonts

APP_NAME = "PrintNum"
APPDATA_ROOT = fonts.APPDATA_ROOT
FONTS_DIR = fonts.FONTS_DIR
BACKGROUNDS_DIR = backgrounds.BACKGROUNDS_DIR
RESOURCES_DIR = APPDATA_ROOT
IMAGES_DIR = BACKGROUNDS_DIR
resource_lock = fonts.resource_lock


def init_resources(force=False):
    """Инициализирует менеджеры ресурсов; шрифты и фоны загружаются лениво."""
    with ExitStack() as stack:
        stack.enter_context(fonts.resource_lock)
        stack.enter_context(backgrounds.resource_lock)
        if fonts.is_initialized() and backgrounds.is_initialized() and not force:
            return
        if force:
            fonts.clear_fonts()
            backgrounds.clear_backgrounds()
        fonts.init_fonts()
        backgrounds.init_backgrounds()
        print("[Ресурсы] Менеджеры ресурсов инициализированы")


def shutdown_resources():
    """Освобождает ресурсы при завершении приложения."""
    with ExitStack() as stack:
        stack.enter_context(fonts.resource_lock)
        stack.enter_context(backgrounds.resource_lock)
        fonts.clear_fonts()
        backgrounds.clear_backgrounds()


def load_font(filename):
    init_resources()
    return fonts.load_font(filename)


def get_font_name(font_name=None):
    init_resources()
    return fonts.get_font_name(font_name)


def get_image(filename):
    init_resources()
    return backgrounds.get_background(filename)


get_background = get_image


@contextmanager
def resource_session():
    """Не даёт очистить/заменить ресурсы до окончания текущей печати."""
    with ExitStack() as stack:
        stack.enter_context(fonts.resource_lock)
        stack.enter_context(backgrounds.resource_lock)
        init_resources()
        yield {
            "fonts": fonts._font_cache,
            "images": backgrounds._background_cache,
            "font_names": fonts._font_names,
            "initialized": fonts.is_initialized() and backgrounds.is_initialized(),
        }
