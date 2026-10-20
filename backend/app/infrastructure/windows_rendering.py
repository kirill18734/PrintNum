"""Отрисовка этикеток для автопечати и ручной печати средствами Windows GDI и Pillow."""

from io import BytesIO
import logging

from app.domain.label_layout import prepare_label_data
from app.infrastructure.print_job import PRINTNUM_DOCUMENT_PREFIX

logger = logging.getLogger(__name__)


def calculate_dimensions(hdc, paper_size_str):
    """Инфраструктурный слой: перевод физических размеров (мм) в пиксели принтера."""
    import win32con

    width_mm, height_mm = map(int, paper_size_str.split('*'))

    dpi_x = hdc.GetDeviceCaps(win32con.LOGPIXELSX)
    dpi_y = hdc.GetDeviceCaps(win32con.LOGPIXELSY)

    width_px = int((width_mm / 25.4) * dpi_x)
    height_px = int((height_mm / 25.4) * dpi_y)

    margin_x = int(width_px * 0.05)
    margin_y = int(height_px * 0.05)

    return {
        "width_px": width_px,
        "height_px": height_px,
        "margin_x": margin_x,
        "margin_y": margin_y,
        "max_allowed_w": width_px - (margin_x * 2)
    }


def draw_header(hdc, text, sizes, force_left):
    """Рендеринг верхнего колонтитула (Header)."""
    import win32con
    import win32ui

    font_top = win32ui.CreateFont({
        "name": "Arial",
        "height": int(sizes["height_px"] * 0.20),
        "weight": win32con.FW_NORMAL,
    })
    hdc.SelectObject(font_top)
    text_w, text_h = hdc.GetTextExtent(text)

    x = sizes["margin_x"] if force_left else sizes["width_px"] - text_w - sizes["margin_x"]
    y = sizes["margin_y"]

    hdc.TextOut(x, y, text)
    return y + text_h


def draw_main_text(hdc, text, sizes, y_start, is_underlined, is_bold):
    """Рендеринг и автоматический подбор размера для центрального текста (Main)."""
    import win32con
    import win32ui

    available_h = sizes["height_px"] - y_start - sizes["margin_y"]
    optimal_height = 10

    # Применяем жирный шрифт на основе флага из бизнес-логики
    font_weight = win32con.FW_BOLD if is_bold else win32con.FW_NORMAL

    # Цикл подбора максимального размера шрифта
    while True:
        test_font = win32ui.CreateFont({
            "name": "Arial",
            "height": optimal_height,
            "weight": font_weight,
            "underline": 1 if is_underlined else 0,
        })
        hdc.SelectObject(test_font)
        w, h = hdc.GetTextExtent(text)

        if w > sizes["max_allowed_w"] or h > available_h:
            optimal_height -= 1
            break
        optimal_height += 1

    final_font = win32ui.CreateFont({
        "name": "Arial",
        "height": optimal_height,
        "weight": font_weight,
        "underline": 1 if is_underlined else 0,
    })
    hdc.SelectObject(final_font)
    text_w, text_h = hdc.GetTextExtent(text)

    x = (sizes["width_px"] - text_w) // 2
    y = y_start + (available_h - text_h) // 2

    hdc.TextOut(x, y, text)
    return optimal_height


def render_number_label(text, config):
    """Render and submit an auto-print label through the Windows spooler."""
    import win32con
    import win32ui

    data = prepare_label_data(text, config)

    hdc = win32ui.CreateDC()
    document_started = False
    try:
        hdc.CreatePrinterDC(config.get('printer'))
        hdc.StartDoc(f"{PRINTNUM_DOCUMENT_PREFIX} Ячейка: {text}")
        document_started = True
        hdc.StartPage()
        hdc.SetBkMode(win32con.TRANSPARENT)
        sizes = calculate_dimensions(hdc, config.get('paper', '30*20'))
        y_start_center = sizes["margin_y"]

        if data["show_header"] and data["header_text"]:
            y_start_center = draw_header(
                hdc,
                text=data["header_text"],
                sizes=sizes,
                force_left=data["force_left_header"]
            )

        draw_main_text(
            hdc,
            text=data["main_text"],
            sizes=sizes,
            y_start=y_start_center,
            is_underlined=data["is_underlined"],
            is_bold=data["is_bold"]
        )

        hdc.EndPage()
        hdc.EndDoc()
        document_started = False
    except Exception:
        if document_started:
            try:
                hdc.AbortDoc()
            except Exception:
                logger.exception("Не удалось отменить задание печати")
        raise
    finally:
        hdc.DeleteDC()


def wrap_text(hdc, text, max_width):
    """Split text into printer-width lines while preserving explicit line breaks."""
    lines = []
    for paragraph in text.splitlines() or [text]:
        words = paragraph.split()
        if not words:
            lines.append('')
            continue

        line = ''
        for word in words:
            candidate = f'{line} {word}' if line else word
            if hdc.GetTextExtent(candidate)[0] <= max_width:
                line = candidate
                continue

            if line:
                lines.append(line)
            line = ''
            for char in word:
                candidate = line + char
                if line and hdc.GetTextExtent(candidate)[0] > max_width:
                    lines.append(line)
                    line = char
                else:
                    line = candidate
        if line:
            lines.append(line)

    return lines or ['']


def draw_label_text(hdc, text, sizes, bold, underline):
    """Рисует текст этикетки для ручной печати так же, как в предпросмотре:
    - если пользователь ввёл переносы строк — сохраняем их и не переносим автоматически;
    - если переносов нет — весь текст в одну строку, подбираем размер шрифта, чтобы уместить по ширине/высоте.
    """
    import win32con
    import win32ui

    available_h = sizes['height_px'] - sizes['margin_y'] * 2
    available_w = sizes['max_allowed_w']

    # Разбиваем только по явным переводам строк; без переносов оставляем одну строку
    raw_lines = text.splitlines() or ['']

    best_height = None
    best_line_height = None

    for font_height in range(1, max(2, available_h + 1)):
        font = win32ui.CreateFont({
            'name': 'Arial',
            'height': font_height,
            'weight': win32con.FW_BOLD if bold else win32con.FW_NORMAL,
            'underline': 1 if underline else 0,
        })
        hdc.SelectObject(font)

        # Высота строки для текущего шрифта
        _, line_h = hdc.GetTextExtent('Ag')
        total_h = line_h * len(raw_lines)
        if total_h > available_h:
            break

        # Проверяем, что каждая строка умещается по ширине без автопереноса
        too_wide = False
        for ln in raw_lines:
            w, _ = hdc.GetTextExtent(ln)
            if w > available_w:
                too_wide = True
                break
        if too_wide:
            # увеличиваем шрифт дальше бессмысленно? Нет, чем больше, тем шире — пропускаем этот размер
            continue

        best_height = font_height
        best_line_height = line_h

    if best_height is None or best_line_height is None:
        raise ValueError('Текст не помещается на выбранной этикетке')

    final_font = win32ui.CreateFont({
        'name': 'Arial',
        'height': best_height,
        'weight': win32con.FW_BOLD if bold else win32con.FW_NORMAL,
        'underline': 1 if underline else 0,
    })
    hdc.SelectObject(final_font)

    total_height = best_line_height * len(raw_lines)
    y = (sizes['height_px'] - total_height) // 2
    for line in raw_lines:
        line_width, _ = hdc.GetTextExtent(line)
        x = (sizes['width_px'] - line_width) // 2
        hdc.TextOut(x, y, line)
        y += best_line_height


def draw_code_image(hdc, image_data, sizes, show_code_text, text):
    from PIL import Image, ImageWin
    import win32ui

    with Image.open(BytesIO(image_data)) as source:
        if source.width > 4096 or source.height > 4096 or source.width * source.height > 8_000_000:
            raise ValueError('Изображение кода слишком большое')
        image = source.convert('RGB')

    caption_height = max(1, int(sizes['height_px'] * 0.18)) if show_code_text else 0
    max_width = sizes['max_allowed_w']
    max_height = sizes['height_px'] - sizes['margin_y'] * 2 - caption_height
    image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

    x = (sizes['width_px'] - image.width) // 2
    y = sizes['margin_y'] + (max_height - image.height) // 2
    ImageWin.Dib(image).draw(hdc.GetHandleOutput(), (x, y, x + image.width, y + image.height))

    if show_code_text:
        font_height = max(1, int(caption_height * 0.55))
        font = win32ui.CreateFont({'name': 'Arial', 'height': font_height})
        hdc.SelectObject(font)
        caption = text.replace('\r', ' ').replace('\n', ' ')
        while caption and hdc.GetTextExtent(caption)[0] > max_width and len(caption) > 1:
            caption = caption[:-2] + '…'
        text_width, text_height = hdc.GetTextExtent(caption)
        hdc.TextOut(
            (sizes['width_px'] - text_width) // 2,
            sizes['height_px'] - sizes['margin_y'] - text_height,
            caption,
        )


def render_manual_label(
    content,
    content_type,
    code_image,
    config,
    bold=False,
    underline=False,
    show_code_text=False,
):
    """Print a manually composed text or machine-readable-code label."""
    import win32con
    import win32ui

    hdc = win32ui.CreateDC()
    document_started = False
    try:
        hdc.CreatePrinterDC(config.get('printer'))
        hdc.StartDoc(f'{PRINTNUM_DOCUMENT_PREFIX} Этикетка: {content[:80]}')
        document_started = True
        hdc.StartPage()
        hdc.SetBkMode(win32con.TRANSPARENT)
        sizes = calculate_dimensions(hdc, config.get('paper', '30*20'))

        if content_type == 'text':
            draw_label_text(hdc, content, sizes, bold, underline)
        else:
            draw_code_image(hdc, code_image, sizes, show_code_text, content)

        hdc.EndPage()
        hdc.EndDoc()
        document_started = False
    except Exception:
        if document_started:
            try:
                hdc.AbortDoc()
            except Exception:
                logger.exception("Не удалось отменить задание печати")
        raise
    finally:
        hdc.DeleteDC()
