from io import BytesIO

from PIL import Image, ImageWin
import win32ui
import win32con
from data import load_config
from utils import clear_printer_queue


def prepare_label_data(text, config):
    """
    Бизнес-логика: парсинг, рокировка (swap) текстов и форматирование строк.
    Не зависит от win32ui, легко покрывается юнит-тестами.
    """
    end_line = config.get('endLine', False)
    id_num = config.get('idNum', True)
    hybrid = config.get('hybrid', False)
    expand = config.get('expand', 0)

    text_split = text.split('-')
    raw_main = text_split[0] if len(text_split) > 0 else ''
    raw_header = text_split[1] if len(text_split) > 1 else ''

    is_numeric = raw_main.isdigit()
    main_text_val = int(raw_main) if is_numeric else 0

    # КГТ-1, КГТ-2, КГТ-3 и т.д.
    # всегда считаются как сработавшее условие hybrid + expand
    is_kgt = raw_main.upper() == "КГТ" and raw_header.isdigit()

    # Обычная логика hybrid остается без изменений.
    # Для КГТ условие считается выполненным всегда.
    is_bold = (
            (hybrid and is_numeric and main_text_val >= expand)
            or is_kgt
    )

    # Триггер рокировки полностью совпадает с условием жирности
    is_swapped = is_bold

    # is_numeric = raw_main.isdigit()
    # main_text_val = int(raw_main) if is_numeric else 0
    #
    # # Жирный шрифт активируется ТОЛЬКО если включен hybrid И значение >= expand
    # is_bold = hybrid and is_numeric and (main_text_val >= expand)
    #
    # # Триггер рокировки полностью совпадает с условием жирности
    # is_swapped = is_bold

    if is_swapped:
        header_text = raw_main
        main_text = raw_header
        force_left_header = True
        show_header = True
    else:
        main_text = raw_main
        show_header = bool(raw_header) and id_num
        header_text = raw_header if show_header else ''
        force_left_header = False

    # Добавление дефисов к header
    if show_header and header_text:
        header_text = f"{header_text}-" if force_left_header else f"-{header_text}"

    # Модификация main по условию endLine
    is_underlined = False
    if end_line:
        is_underlined = True
    else:
        main_text += '.'

    return {
        "main_text": main_text,
        "header_text": header_text,
        "show_header": show_header,
        "force_left_header": force_left_header,
        "is_underlined": is_underlined,
        "is_bold": is_bold  # Передаем обновленный флаг
    }


def calculate_dimensions(hdc, paper_size_str):
    """Инфраструктурный слой: перевод физических размеров (мм) в пиксели принтера."""
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


def print_text(text):
    """Главная управляющая функция (Оркестратор)."""
    config = load_config()

    clear_printer_queue()
    data = prepare_label_data(text, config)

    hdc = win32ui.CreateDC()
    hdc.CreatePrinterDC(config.get('printer'))

    hdc.StartDoc(f"Ячейка: {text}")
    hdc.StartPage()

    try:
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

        opt_h = draw_main_text(
            hdc,
            text=data["main_text"],
            sizes=sizes,
            y_start=y_start_center,
            is_underlined=data["is_underlined"],
            is_bold=data["is_bold"]
        )

        hdc.EndPage()
        hdc.EndDoc()
        print(f"Отправлено. Шрифт: {opt_h}px. Жирный: {data['is_bold']}. Текст хедера: '{data['header_text']}'")

    except Exception as e:
        print(f"Ошибка при печати: {e}")
        hdc.AbortDoc()
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
    available_h = sizes['height_px'] - sizes['margin_y'] * 2
    available_w = sizes['max_allowed_w']
    best = None

    for font_height in range(1, max(2, available_h + 1)):
        font = win32ui.CreateFont({
            'name': 'Arial',
            'height': font_height,
            'weight': win32con.FW_BOLD if bold else win32con.FW_NORMAL,
            'underline': 1 if underline else 0,
        })
        hdc.SelectObject(font)
        lines = wrap_text(hdc, text, available_w)
        _, line_height = hdc.GetTextExtent('Ag')
        total_height = line_height * len(lines)
        if total_height > available_h:
            break
        best = (font, lines, line_height, total_height)

    if best is None:
        raise ValueError('Текст не помещается на выбранной этикетке')

    font, lines, line_height, total_height = best
    hdc.SelectObject(font)
    y = (sizes['height_px'] - total_height) // 2
    for line in lines:
        line_width, _ = hdc.GetTextExtent(line)
        x = (sizes['width_px'] - line_width) // 2
        hdc.TextOut(x, y, line)
        y += line_height


def draw_code_image(hdc, image_data, sizes, show_code_text, text):
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


def print_label(content, content_type, code_image, config, bold=False, underline=False, show_code_text=False):
    """Print a manually composed text or machine-readable-code label."""
    hdc = win32ui.CreateDC()
    hdc.CreatePrinterDC(config.get('printer'))

    try:
        hdc.StartDoc(f'Этикетка: {content[:80]}')
        hdc.StartPage()
        hdc.SetBkMode(win32con.TRANSPARENT)
        sizes = calculate_dimensions(hdc, config.get('paper', '30*20'))

        if content_type == 'text':
            draw_label_text(hdc, content, sizes, bold, underline)
        else:
            draw_code_image(hdc, code_image, sizes, show_code_text, content)

        hdc.EndPage()
        hdc.EndDoc()
    except Exception:
        hdc.AbortDoc()
        raise
    finally:
        hdc.DeleteDC()
