"""Совместимый фасад для работы с ресурсами PrintNum.

Шрифты и фоновые изображения хранятся в отдельных модулях.
Публичные функции сохранены для существующих импортов из app.resources.
"""

from contextlib import contextmanager, ExitStack

from . import backgrounds, fonts


APP_NAME = "PrintNum"
APPDATA_ROOT = fonts.APPDATA_ROOT
FONTS_DIR = fonts.FONTS_DIR
BACKGROUNDS_DIR = backgrounds.BACKGROUNDS_DIR

# Совместимость с прежними именами путей и API.
RESOURCES_DIR = APPDATA_ROOT
IMAGES_DIR = BACKGROUNDS_DIR
resource_lock = fonts.resource_lock


def init_resources(force=False):
    """Инициализирует кеш шрифтов и фоновых изображений."""

    with ExitStack() as stack:
        stack.enter_context(fonts.resource_lock)
        stack.enter_context(backgrounds.resource_lock)

        if (
            fonts.is_initialized()
            and backgrounds.is_initialized()
            and not force
        ):
            return

        if force:
            fonts.clear_fonts()
            backgrounds.clear_backgrounds()

        print("[Ресурсы] Начало загрузки...")

        fonts.init_fonts()
        backgrounds.init_backgrounds()

        print(
            "[Ресурсы] Загрузка завершена. "
            f"Шрифтов: {len(fonts._font_cache)}, "
            f"фонов: {len(backgrounds._background_cache)}"
        )


def shutdown_resources():
    """Освобождает ресурсы при завершении приложения."""

    with ExitStack() as stack:
        stack.enter_context(fonts.resource_lock)
        stack.enter_context(backgrounds.resource_lock)

        fonts.clear_fonts()
        backgrounds.clear_backgrounds()


def load_font(filename):
    """Возвращает уже загруженный шрифт."""

    init_resources()
    return fonts.load_font(filename)


def get_font_name(font_name=None):
    """Возвращает настоящее название семейства шрифта."""

    init_resources()
    return fonts.get_font_name(font_name)


def get_image(filename):
    """Возвращает байты фонового изображения из кеша."""

    init_resources()
    return backgrounds.get_background(filename)


# Новое имя для кода, который явно работает с фонами.
get_background = get_image


@contextmanager
def resource_session():
    """Защищает кеши ресурсов от очистки во время печати."""

    with ExitStack() as stack:
        stack.enter_context(fonts.resource_lock)
        stack.enter_context(backgrounds.resource_lock)

        init_resources()

        yield {
            "fonts": fonts._font_cache,
            "images": backgrounds._background_cache,
            "font_names": fonts._font_names,
            "initialized": (
                fonts.is_initialized()
                and backgrounds.is_initialized()
            ),
        }
