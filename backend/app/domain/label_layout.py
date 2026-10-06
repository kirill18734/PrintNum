"""Бизнес-правила форматирования содержимого этикетки для автопечати."""

def prepare_label_data(text, config):
    """Apply the configured number/header formatting rules."""
    end_line = config.get("endLine", False)
    id_num = config.get("idNum", True)
    hybrid = config.get("hybrid", False)
    expand = config.get("expand", 0)

    text_split = text.split("-")
    raw_main = text_split[0] if text_split else ""
    raw_header = text_split[1] if len(text_split) > 1 else ""

    is_numeric = raw_main.isdigit()
    main_text_val = int(raw_main) if is_numeric else 0
    is_kgt = raw_main.upper() == "КГТ" and raw_header.isdigit()
    is_bold = (hybrid and is_numeric and main_text_val >= expand) or is_kgt
    is_swapped = is_bold

    if is_swapped:
        header_text = raw_main
        main_text = raw_header
        force_left_header = True
        show_header = True
    else:
        main_text = raw_main
        show_header = bool(raw_header) and id_num
        header_text = raw_header if show_header else ""
        force_left_header = False

    if show_header and header_text:
        header_text = f"{header_text}-" if force_left_header else f"-{header_text}"

    is_underlined = bool(end_line)
    if not end_line:
        main_text += "."

    return {
        "main_text": main_text,
        "header_text": header_text,
        "show_header": show_header,
        "force_left_header": force_left_header,
        "is_underlined": is_underlined,
        "is_bold": is_bold,
    }
