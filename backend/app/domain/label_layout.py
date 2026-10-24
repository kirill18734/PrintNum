"""Бизнес-правила форматирования содержимого этикетки для автопечати."""

def prepare_label_data(text, config):
    """Apply the configured number/header formatting rules."""
    end_line = config.get("endLine", False)
    id_num = config.get("idNum", True)
    hybrid = config.get("hybrid", False)
    expand = config.get("expand", 0)
    bold_always = config.get("bold", False)

    parts = text.split("-", 1)
    raw_main = parts[0] if parts else ""
    raw_header = parts[1] if len(parts) > 1 else ""

    # Специальный случай для Ozon полки: печатать как «П-<номер>» без точки
    is_ozon_shelf = raw_main.upper() == "П" and raw_header.isdigit()

    is_numeric = raw_main.isdigit()
    main_text_val = int(raw_main) if is_numeric else 0
    is_kgt = raw_main.upper() == "КГТ"

    # Выделение по правилам гибрида/КГТ влияет на перестановку, но не блокирует ручное "Жирный шрифт"
    emphasize_by_rule = (hybrid and is_numeric and main_text_val >= expand) or is_kgt
    is_swapped = emphasize_by_rule
    style_bold = bold_always or emphasize_by_rule

    if is_ozon_shelf:
        # Печатаем цельной строкой без заголовка
        main_text = f"П-{raw_header}"
        header_text = ""
        force_left_header = False
        show_header = False
    elif is_swapped:
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

    # Подчёркивание: по конфигу для всех, кроме Ozon-полки
    is_underlined = False if is_ozon_shelf else bool(end_line)
    # Точка: как раньше, но для Ozon-полки никогда не добавляем
    if not end_line and not is_ozon_shelf:
        main_text += "."

    return {
        "main_text": main_text,
        "header_text": header_text,
        "show_header": show_header,
        "force_left_header": force_left_header,
        "is_underlined": is_underlined,
        "is_bold": style_bold,
    }
