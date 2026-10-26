
import win32ui
import win32con

from app.data import load_config
from app.utils import clear_printer_queue, find_excluded_rule
from app.printer_common import calculate_dimensions


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

        is_swapped = (
            (hybrid and main_text_val >= expand)
            or is_kgt
        )

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


def draw_header(hdc, text, sizes, force_left):
    """Рисует верхний колонтитул."""
    font_top = win32ui.CreateFont({
        "name": "Arial",
        "height": int(sizes["height_px"] * 0.20),
        "weight": win32con.FW_NORMAL,
    })

    hdc.SelectObject(font_top)
    text_w, text_h = hdc.GetTextExtent(text)

    x = (
        sizes["margin_x"]
        if force_left
        else sizes["width_px"] - text_w - sizes["margin_x"]
    )
    y = sizes["margin_y"]

    hdc.TextOut(x, y, text)

    return y + text_h


def draw_main_text(hdc, text, sizes, y_start, is_underlined, is_bold):
    """Рисует центральный текст с прежним алгоритмом подбора шрифта."""
    available_h = sizes["height_px"] - y_start - sizes["margin_y"]
    optimal_height = 10

    font_weight = (
        win32con.FW_BOLD if is_bold else win32con.FW_NORMAL
    )

    while True:
        test_font = win32ui.CreateFont({
            "name": "Arial",
            "height": optimal_height,
            "weight": font_weight,
            "underline": 1 if is_underlined else 0,
        })

        hdc.SelectObject(test_font)
        width, height = hdc.GetTextExtent(text)

        if (
            width > sizes["max_allowed_w"]
            or height > available_h
        ):
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
    """Главная функция автоматической печати."""
    config = load_config()

    excluded_rule = find_excluded_rule(
        text,
        config.get("excludedTexts", []),
    )
    print(excluded_rule)
    if excluded_rule:
        print(
            "Печать пропущена. "
            f"Текст '{text}' соответствует правилу "
            f"исключения '{excluded_rule}'"
        )
        return

    printer_name = config.get("printer")

    if not isinstance(printer_name, str) or not printer_name.strip():
        raise ValueError("Не задан принтер для печати")

    clear_printer_queue()
    data = prepare_label_data(text, config)

    hdc = win32ui.CreateDC()
    document_started = False

    try:
        hdc.CreatePrinterDC(printer_name)

        hdc.StartDoc(f"PrintNum: {text}")
        document_started = True

        hdc.StartPage()
        hdc.SetBkMode(win32con.TRANSPARENT)

        sizes = calculate_dimensions(
            hdc,
            config.get("paper", "30*20"),
        )

        y_start_center = sizes["margin_y"]

        if data["show_header"] and data["header_text"]:
            y_start_center = draw_header(
                hdc,
                text=data["header_text"],
                sizes=sizes,
                force_left=data["force_left_header"],
            )

        opt_h = draw_main_text(
            hdc,
            text=data["main_text"],
            sizes=sizes,
            y_start=y_start_center,
            is_underlined=data["is_underlined"],
            is_bold=data["is_bold"],
        )

        hdc.EndPage()
        hdc.EndDoc()
        document_started = False

        print(
            f"Отправлено. Шрифт: {opt_h}px. "
            f"Жирный: {data['is_bold']}. "
            f"Текст хедера: '{data['header_text']}'"
        )

    except Exception:
        if document_started:
            try:
                hdc.AbortDoc()
            except Exception:
                pass

        raise

    finally:
        hdc.DeleteDC()
