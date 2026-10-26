
import win32con


def calculate_dimensions(hdc, paper_size_str):
    """Переводит физические размеры бумаги из мм в пиксели принтера."""
    try:
        width_mm, height_mm = map(int, paper_size_str.split("*"))
    except (ValueError, AttributeError):
        raise ValueError(
            "Размер бумаги должен иметь формат WIDTH*HEIGHT"
        ) from None

    if width_mm <= 0 or height_mm <= 0:
        raise ValueError("Размеры бумаги должны быть положительными")

    dpi_x = hdc.GetDeviceCaps(win32con.LOGPIXELSX)
    dpi_y = hdc.GetDeviceCaps(win32con.LOGPIXELSY)

    if dpi_x <= 0 or dpi_y <= 0:
        raise ValueError("Не удалось определить DPI принтера")

    width_px = int((width_mm / 25.4) * dpi_x)
    height_px = int((height_mm / 25.4) * dpi_y)

    margin_x = int(width_px * 0.05)
    margin_y = int(height_px * 0.05)

    return {
        "width_px": width_px,
        "height_px": height_px,
        "margin_x": margin_x,
        "margin_y": margin_y,
        "max_allowed_w": width_px - (margin_x * 2),
    }
