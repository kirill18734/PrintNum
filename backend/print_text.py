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
    
    # Жирный шрифт активируется ТОЛЬКО если включен hybrid И значение >= expand
    is_bold = hybrid and is_numeric and (main_text_val >= expand)
    
    # Триггер рокировки полностью совпадает с условием жирности
    is_swapped = is_bold
    
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