
import base64
import binascii
from io import BytesIO

from PIL import Image, ImageWin
import win32ui
import win32con

from app.data import load_config
from app.printer_common import calculate_dimensions


CONTENT_TYPES = ("text", "barcode", "qr", "datamatrix")

MAX_CONTENT_LENGTH = 4096
MAX_CODE_IMAGE_SIZE = 4 * 1024 * 1024

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


class LabelRequestError(ValueError):
    """Некорректный запрос на печать этикетки."""


class PrinterNotConfiguredError(RuntimeError):
    """Принтер не настроен."""


def draw_code_image(hdc, image_data, sizes, show_code_text, text):
    with Image.open(BytesIO(image_data)) as source:
        if (
            source.width > 4096
            or source.height > 4096
            or source.width * source.height > 8_000_000
        ):
            raise ValueError("Изображение кода слишком большое")

        image = source.convert("RGB")

    caption_height = (
        max(1, int(sizes["height_px"] * 0.18))
        if show_code_text
        else 0
    )

    max_width = sizes["max_allowed_w"]
    max_height = (
        sizes["height_px"]
        - sizes["margin_y"] * 2
        - caption_height
    )

    image.thumbnail(
        (max_width, max_height),
        Image.Resampling.LANCZOS,
    )

    x = (sizes["width_px"] - image.width) // 2
    y = sizes["margin_y"] + (max_height - image.height) // 2

    ImageWin.Dib(image).draw(
        hdc.GetHandleOutput(),
        (x, y, x + image.width, y + image.height),
    )

    if show_code_text:
        font_height = max(1, int(caption_height * 0.55))

        font = win32ui.CreateFont({
            "name": "Arial",
            "height": font_height,
        })

        hdc.SelectObject(font)

        caption = text.replace("\r", " ").replace("\n", " ")

        while (
            caption
            and hdc.GetTextExtent(caption)[0] > max_width
            and len(caption) > 1
        ):
            caption = caption[:-2] + "…"

        text_width, text_height = hdc.GetTextExtent(caption)

        hdc.TextOut(
            (sizes["width_px"] - text_width) // 2,
            sizes["height_px"] - sizes["margin_y"] - text_height,
            caption,
        )


def draw_label_text(hdc, text, sizes, bold, underline):
    """
    Рисует текст этикетки.

    Сохраняет прежний алгоритм перебора размеров шрифта,
    явные переносы строк и центрирование.
    """
    available_h = sizes["height_px"] - sizes["margin_y"] * 2
    available_w = sizes["max_allowed_w"]

    raw_lines = text.splitlines() or [""]

    best_height = None
    best_line_height = None

    for font_height in range(1, max(2, available_h + 1)):
        font = win32ui.CreateFont({
            "name": "Arial",
            "height": font_height,
            "weight": (
                win32con.FW_BOLD
                if bold
                else win32con.FW_NORMAL
            ),
            "underline": 1 if underline else 0,
        })

        hdc.SelectObject(font)

        _, line_h = hdc.GetTextExtent("Ag")
        total_h = line_h * len(raw_lines)

        if total_h > available_h:
            break

        too_wide = False

        for line in raw_lines:
            width, _ = hdc.GetTextExtent(line)

            if width > available_w:
                too_wide = True
                break

        if too_wide:
            continue

        best_height = font_height
        best_line_height = line_h

    if best_height is None or best_line_height is None:
        raise ValueError("Текст не помещается на выбранной этикетке")

    final_font = win32ui.CreateFont({
        "name": "Arial",
        "height": best_height,
        "weight": (
            win32con.FW_BOLD
            if bold
            else win32con.FW_NORMAL
        ),
        "underline": 1 if underline else 0,
    })

    hdc.SelectObject(final_font)

    total_height = best_line_height * len(raw_lines)
    y = (sizes["height_px"] - total_height) // 2

    for line in raw_lines:
        line_width, _ = hdc.GetTextExtent(line)
        x = (sizes["width_px"] - line_width) // 2

        hdc.TextOut(x, y, line)
        y += best_line_height


def render_manual_label(
    content,
    content_type,
    code_image,
    bold=False,
    underline=False,
    show_code_text=False,
    config=None,
):
    """Печатает текстовую этикетку или изображение кода."""
    if config is None:
        config = load_config()

    printer_name = config.get("printer")

    if not isinstance(printer_name, str) or not printer_name.strip():
        raise PrinterNotConfiguredError("Сначала выберите принтер")

    hdc = win32ui.CreateDC()
    document_started = False

    try:
        hdc.CreatePrinterDC(printer_name)

        hdc.StartDoc(f"PrintNum: {content[:80]}")
        document_started = True

        hdc.StartPage()
        hdc.SetBkMode(win32con.TRANSPARENT)

        sizes = calculate_dimensions(
            hdc,
            config.get("paper", "30*20"),
        )

        if content_type == "text":
            draw_label_text(
                hdc,
                content,
                sizes,
                bold,
                underline,
            )
        else:
            draw_code_image(
                hdc,
                code_image,
                sizes,
                show_code_text,
                content,
            )

        hdc.EndPage()
        hdc.EndDoc()
        document_started = False

    except Exception:
        if document_started:
            try:
                hdc.AbortDoc()
            except Exception:
                pass

        raise

    finally:
        hdc.DeleteDC()


def parse_label_request(body):
    """Проверяет входные данные до обращения к принтеру."""
    if not isinstance(body, dict):
        raise LabelRequestError("Ожидается JSON-объект")

    content_type = body.get("contentType")

    if content_type not in CONTENT_TYPES:
        raise LabelRequestError(
            "Неизвестный тип содержимого этикетки"
        )

    content = body.get("content")

    if not isinstance(content, str) or not content.strip():
        raise LabelRequestError(
            "Поле content должно содержать текст"
        )

    if len(content) > MAX_CONTENT_LENGTH:
        raise LabelRequestError(
            f"Содержимое этикетки не должно превышать "
            f"{MAX_CONTENT_LENGTH} символов"
        )

    options = {}

    for name in ("bold", "underline", "showCodeText"):
        value = body.get(name, False)

        if not isinstance(value, bool):
            raise LabelRequestError(
                f"Поле {name} должно быть логическим значением"
            )

        options[name] = value

    code_image = None

    if content_type != "text":
        encoded_image = body.get("codeImage")

        if not isinstance(encoded_image, str) or not encoded_image:
            raise LabelRequestError(
                "Для печати кода необходимо передать его изображение"
            )

        max_encoded_size = 4 * (
            (MAX_CODE_IMAGE_SIZE + 2) // 3
        )

        if len(encoded_image) > max_encoded_size:
            raise LabelRequestError(
                "Размер изображения кода не должен превышать 4 МБ"
            )

        try:
            code_image = base64.b64decode(
                encoded_image,
                validate=True,
            )
        except (binascii.Error, ValueError) as error:
            raise LabelRequestError(
                "Изображение кода имеет неверный формат"
            ) from error

        if not code_image or len(code_image) > MAX_CODE_IMAGE_SIZE:
            raise LabelRequestError(
                "Размер изображения кода должен быть не более 4 МБ"
            )

        if not code_image.startswith(PNG_SIGNATURE):
            raise LabelRequestError(
                "Изображение кода должно быть в формате PNG"
            )

    return {
        "content": content,
        "content_type": content_type,
        "code_image": code_image,
        "bold": options["bold"],
        "underline": options["underline"],
        "show_code_text": options["showCodeText"],
    }


def print_label(body):
    """Проверяет запрос и запускает печать."""
    label = parse_label_request(body)

    config = load_config()
    printer_name = config.get("printer")

    if not isinstance(printer_name, str) or not printer_name.strip():
        raise PrinterNotConfiguredError("Сначала выберите принтер")

    render_manual_label(
        **label,
        config=config,
    )
