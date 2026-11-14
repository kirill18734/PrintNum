import win32ui
import win32con

from io import BytesIO
from PIL import Image, ImageDraw, ImageFont, ImageWin

from app.config import load_config
from app.fonts import resource_session, get_font_name, load_font
from app.utils import clear_printer_queue, find_excluded_rule, calculate_dimensions


def prepare_label_data(text, config):
    """Подготавливает текст и параметры форматирования этикетки."""
    end_line = config.get("endLine", False)
    id_num = config.get("idNum", True)
    hybrid = config.get("hybrid", False)
    expand = config.get("expand", 0)
    bold = config.get("bold", False)

    raw_main, _, raw_header = text.partition("-")
    main_text = raw_main
    header_text = ""
    show_header = False
    force_left_header = False
    is_underlined = False
    is_bold = bold

    if raw_main.strip().casefold() == "ozon полка":
        main_text = f"П-{raw_header}"
    else:
        main_text_val = int(raw_main) if raw_main.isdigit() else 0
        is_kgt = raw_main.upper() == "КГТ"
        is_swapped = (hybrid and main_text_val >= expand) or is_kgt

        if is_swapped:
            main_text = raw_header
            header_text = f"{raw_main}-"
            show_header = True
            force_left_header = True
            is_bold = True
        else:
            show_header = bool(raw_header) and id_num
            if show_header:
                header_text = f"-{raw_header}"

        if end_line:
            is_underlined = True
        else:
            main_text += "."

    return {
        "main_text": main_text,
        "header_text": header_text,
        "show_header": show_header,
        "force_left_header": force_left_header,
        "is_underlined": is_underlined,
        "is_bold": is_bold,
    }


def _draw_pillow_text(canvas, text, x, y, font_data, font_size,
                      bold=False, underline=False):
    """Рисует пользовательский TTF/OTF на общей поверхности этикетки."""
    font = ImageFont.truetype(BytesIO(font_data), size=max(1, font_size))
    draw = ImageDraw.Draw(canvas)
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=1 if bold else 0)
    draw.text(
        (x - bbox[0], y - bbox[1]),
        text,
        font=font,
        fill=(0, 0, 0, 255),
        stroke_width=1 if bold else 0,
        stroke_fill=(0, 0, 0, 255),
    )
    if underline:
        baseline = y + (bbox[3] - bbox[1]) + max(1, font_size // 14)
        draw.line((x, baseline, x + bbox[2] - bbox[0], baseline), fill=(0, 0, 0, 255), width=max(1, font_size // 18))
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_header(hdc, text, sizes, force_left, font_name="Arial", font_data=None, canvas=None):
    """Рисует верхний колонтитул."""
    if font_data:
        font_size = max(1, int(sizes["height_px"] * 0.20))
        font = ImageFont.truetype(BytesIO(font_data), size=font_size)
        probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))
        bbox = probe.textbbox((0, 0), text, font=font)
        text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        x = sizes["margin_x"] if force_left else sizes["width_px"] - text_w - sizes["margin_x"]
        y = sizes["margin_y"]
        _draw_pillow_text(canvas, text, x, y, font_data, font_size)
        return y + text_h

    font_top = win32ui.CreateFont({
        "name": font_name,
        "height": int(sizes["height_px"] * 0.20),
        "weight": win32con.FW_NORMAL,
    })
    hdc.SelectObject(font_top)
    text_w, text_h = hdc.GetTextExtent(text)
    x = sizes["margin_x"] if force_left else sizes["width_px"] - text_w - sizes["margin_x"]
    y = sizes["margin_y"]
    hdc.TextOut(x, y, text)
    return y + text_h


def draw_main_text(hdc, text, sizes, y_start, is_underlined, is_bold,
                   font_name="Arial", font_data=None, canvas=None):
    """Рисует центральный текст с подбором оптимального размера."""
    available_h = sizes["height_px"] - y_start - sizes["margin_y"]

    if font_data:
        probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))
        optimal_height = 1
        best = None
        for candidate in range(1, max(2, available_h + 1)):
            font = ImageFont.truetype(BytesIO(font_data), size=candidate)
            bbox = probe.textbbox((0, 0), text, font=font, stroke_width=1 if is_bold else 0)
            width, height = bbox[2] - bbox[0], bbox[3] - bbox[1]
            if width > sizes["max_allowed_w"] or height > available_h:
                break
            best = (candidate, width, height)
        if best is None:
            raise ValueError("Текст не помещается на выбранной этикетке")
        optimal_height, text_w, text_h = best
        x = (sizes["width_px"] - text_w) // 2
        y = y_start + (available_h - text_h) // 2
        _draw_pillow_text(
            canvas, text, x, y, font_data, optimal_height,
            bold=is_bold, underline=is_underlined,
        )
        return optimal_height

    optimal_height = 10
    font_weight = win32con.FW_BOLD if is_bold else win32con.FW_NORMAL
    while True:
        test_font = win32ui.CreateFont({
            "name": font_name,
            "height": optimal_height,
            "weight": font_weight,
            "underline": 1 if is_underlined else 0,
        })
        hdc.SelectObject(test_font)
        width, height = hdc.GetTextExtent(text)
        if width > sizes["max_allowed_w"] or height > available_h:
            optimal_height -= 1
            break
        optimal_height += 1

    final_font = win32ui.CreateFont({
        "name": font_name,
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
    """Главная функция автоматической печати."""
    config = load_config()
    excluded_rule = find_excluded_rule(text, config.get("excludedTexts", []))
    if excluded_rule:
        print(
            "Печать пропущена. "
            f"Текст '{text}' соответствует правилу исключения '{excluded_rule}'"
        )
        return

    printer_name = config.get("printer")
    if not isinstance(printer_name, str) or not printer_name.strip():
        raise ValueError("Не задан принтер для печати")

    clear_printer_queue()
    data = prepare_label_data(text, config)

    with resource_session():
        selected_font = load_font(config.get("font"))
        font_name = selected_font["family"] if selected_font else get_font_name()
        font_data = selected_font["data"] if selected_font else None

        hdc = win32ui.CreateDC()
        document_started = False
        try:
            hdc.CreatePrinterDC(printer_name)
            hdc.StartDoc(f"PrintNum: {text}")
            document_started = True
            hdc.StartPage()
            hdc.SetBkMode(win32con.TRANSPARENT)

            sizes = calculate_dimensions(hdc, config.get("paper", "30*20"))
            raster_canvas = (
                Image.new("RGB", (sizes["width_px"], sizes["height_px"]), "white")
                if font_data else None
            )
            y_start_center = sizes["margin_y"]

            if data["show_header"] and data["header_text"]:
                y_start_center = draw_header(
                    hdc, data["header_text"], sizes,
                    data["force_left_header"], font_name, font_data,
                    raster_canvas,
                )

            opt_h = draw_main_text(
                hdc, data["main_text"], sizes, y_start_center,
                data["is_underlined"], data["is_bold"],
                font_name, font_data, raster_canvas,
            )
            if raster_canvas is not None:
                ImageWin.Dib(raster_canvas).draw(
                    hdc.GetHandleOutput(),
                    (0, 0, sizes["width_px"], sizes["height_px"]),
                )
            hdc.EndPage()
            hdc.EndDoc()
            document_started = False
            print(f"Отправлено. Шрифт: {font_name}, размер: {opt_h}px.")
        except Exception:
            if document_started:
                try:
                    hdc.AbortDoc()
                except Exception:
                    pass
            raise
        finally:
            hdc.DeleteDC()
