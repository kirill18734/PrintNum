import os
import time
import threading
import uuid
from threading import Lock

from flask import Flask, request, jsonify
from flask_cors import CORS
from data import load_config
from filter_rules import find_excluded_rule
from label_data import LabelRequestError, parse_label_request
from utils import listPrinters, status_printer
from print_text import print_label, print_text

app = Flask(__name__)
CORS(app)  # Включаем CORS для всего приложения
app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({'error': 'Размер запроса превышает 6 МБ'}), 413


# Время последнего запроса
last_request_time = time.time()

# Через сколько секунд убивать сервер
TIMEOUT = 10

printerOnline = False
lastSkipped = None
lastSkippedLock = Lock()

@app.before_request
def update_activity():
    """
    Обновляем время активности
    перед каждым запросом
    """
    global last_request_time

    last_request_time = time.time()

def watchdog():
    """
    Следит за неактивностью
    """
    global last_request_time

    while True:
        inactive_time = time.time() - last_request_time

        if inactive_time > TIMEOUT:
            print(f"Нет запросов {TIMEOUT} секунд")
            print("Flask сервер завершен")
        
            os._exit(0)

        time.sleep(1)

@app.get("/")
def hello_world():
      return jsonify({"status": True})

@app.get('/status-printer')
def statusPrinter():
    global printerOnline
    printerOnline = status_printer()
    return jsonify({'printerOnline': printerOnline})

@app.get('/listPrinters')
def listPrinter():
    printers = listPrinters()
    return jsonify({'listPrinters': printers})

@app.get('/last-skipped')
def lastSkippedText():
    with lastSkippedLock:
        event = lastSkipped.copy() if lastSkipped else None
    return jsonify({'event': event})

@app.post('/print-number')
def printNumber():
    global lastSkipped

    body = request.get_json(silent=True)
    if not isinstance(body, dict) or not isinstance(body.get("text"), str):
        return jsonify({'error': 'Поле text должно быть строкой'}), 400

    config = load_config().copy()
    text = body["text"].strip()
    if not text or not config.get('running'):
        return "OK"

    matched_rule = find_excluded_rule(text, config.get('excludedTexts', []))
    if matched_rule:
        with lastSkippedLock:
            lastSkipped = {
                'id': uuid.uuid4().hex,
                'rule': matched_rule,
                'text': text,
                'timestamp': int(time.time() * 1000),
            }
        return jsonify({'status': 'skipped', 'rule': matched_rule})

    if config.get('printer') and printerOnline:
        print_text(text)
    return "OK"


@app.post('/print-label')
def printLabel():
    global printerOnline

    try:
        label = parse_label_request(request.get_json(silent=True))
    except LabelRequestError as error:
        return jsonify({'error': str(error)}), 400

    config = load_config().copy()
    if not config.get('printer'):
        return jsonify({'error': 'Сначала выберите принтер'}), 409

    printerOnline = status_printer()
    if not printerOnline:
        return jsonify({'error': 'Принтер не готов к печати'}), 503

    try:
        print_label(
            content=label['content'],
            content_type=label['content_type'],
            code_image=label['code_image'],
            config=config,
            bold=label['bold'],
            underline=label['underline'],
            show_code_text=label['show_code_text'],
        )
    except Exception:
        app.logger.exception('Не удалось напечатать этикетку')
        return jsonify({'error': 'Не удалось отправить этикетку на принтер'}), 500

    return jsonify({'status': 'printed'})


if __name__ == "__main__":
    # Запускаем watchdog
    threading.Thread(
        target=watchdog,
        daemon=True
    ).start()

    app.run()