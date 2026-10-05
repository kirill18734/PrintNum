import base64
import binascii


CONTENT_TYPES = ('text', 'barcode', 'qr', 'datamatrix')
MAX_CONTENT_LENGTH = 4096
MAX_CODE_IMAGE_SIZE = 4 * 1024 * 1024
PNG_SIGNATURE = b'\x89PNG\r\n\x1a\n'


class LabelRequestError(ValueError):
    pass


def parse_label_request(body):
    if not isinstance(body, dict):
        raise LabelRequestError('Ожидается JSON-объект')

    content_type = body.get('contentType')
    if content_type not in CONTENT_TYPES:
        raise LabelRequestError('Неизвестный тип содержимого этикетки')

    content = body.get('content')
    if not isinstance(content, str) or not content.strip():
        raise LabelRequestError('Поле content должно содержать текст')
    if len(content) > MAX_CONTENT_LENGTH:
        raise LabelRequestError(
            f'Содержимое этикетки не должно превышать {MAX_CONTENT_LENGTH} символов'
        )

    options = {}
    for name in ('bold', 'underline', 'showCodeText'):
        value = body.get(name, False)
        if not isinstance(value, bool):
            raise LabelRequestError(f'Поле {name} должно быть логическим значением')
        options[name] = value

    code_image = None
    if content_type != 'text':
        encoded_image = body.get('codeImage')
        if not isinstance(encoded_image, str) or not encoded_image:
            raise LabelRequestError('Для печати кода необходимо передать его изображение')
        try:
            code_image = base64.b64decode(encoded_image, validate=True)
        except (binascii.Error, ValueError) as error:
            raise LabelRequestError('Изображение кода имеет неверный формат') from error
        if not code_image or len(code_image) > MAX_CODE_IMAGE_SIZE:
            raise LabelRequestError('Размер изображения кода должен быть не более 4 МБ')
        if not code_image.startswith(PNG_SIGNATURE):
            raise LabelRequestError('Изображение кода должно быть в формате PNG')

    return {
        'content_type': content_type,
        'content': content,
        'code_image': code_image,
        'bold': options['bold'],
        'underline': options['underline'],
        'show_code_text': options['showCodeText'],
    }
