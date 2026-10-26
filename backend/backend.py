
import sys
import time
import threading

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.serving import make_server

from app.utils import list_printers, status_printer
from app.auto_print import print_text
from app.label_print import (
    print_label,
    LabelRequestError,
    PrinterNotConfiguredError,
)


app = Flask(__name__)
CORS(app)

TIMEOUT = 10
STANDALONE = "--standalone" in sys.argv

# Состояние принтера, обновляемое через /status-printer.
printerOnline = False

# Защита общих данных и последовательное выполнение печати.
_state_lock = threading.Lock()
_print_lock = threading.Lock()

_last_request_time = time.monotonic()

# Событие запроса на завершение сервера.
_shutdown_requested = threading.Event()

# Экземпляр HTTP-сервера Werkzeug.
_server = None


@app.before_request
def update_activity():
    """Обновляет время активности приложения."""
    global _last_request_time

    with _state_lock:
        _last_request_time = time.monotonic()


def get_printer_online():
    """Возвращает последнее известное состояние принтера."""
    with _state_lock:
        return printerOnline


def set_printer_online(value):
    """Обновляет сохранённое состояние принтера."""
    global printerOnline

    with _state_lock:
        printerOnline = bool(value)


def watchdog():
    """Останавливает сервер по запросу или тайм-ауту простоя."""
    while True:
        # Ожидание запроса остановки не блокирует её обработку
        # дольше одной секунды.
        if _shutdown_requested.wait(1):
            print("Получен запрос на остановку сервера")
            break

        # В автономном режиме тайм-аут отключён,
        # но запрос /shutdown продолжает работать.
        if STANDALONE:
            continue

        with _state_lock:
            inactive_time = time.monotonic() - _last_request_time

        if inactive_time > TIMEOUT:
            print(f"Нет запросов {TIMEOUT} секунд")
            break

    print("Остановка Flask-сервера")

    if _server is not None:
        # shutdown() вызывается из watchdog-потока,
        # а serve_forever() работает в основном потоке.
        _server.shutdown()


@app.get("/")
def hello_world():
    return jsonify({"status": True})


@app.post("/shutdown")
def shutdown_route():
    """Запрашивает штатную остановку HTTP-сервера."""

    # Принимаем запросы только с локального компьютера.
    if request.remote_addr not in ("127.0.0.1", "::1"):
        return jsonify({
            "status": False,
            "error": "Доступ запрещён",
        }), 403

    # Дополнительная проверка запроса на остановку.
    if request.headers.get("X-PrintNum-Shutdown") != "local-client":
        return jsonify({
            "status": False,
            "error": "Отсутствует заголовок остановки",
        }), 403

    _shutdown_requested.set()

    return jsonify({
        "status": True,
        "message": "Запрошена остановка сервера",
    })


@app.get("/status-printer")
def status_printer_route():
    """Проверяет принтер и сохраняет его состояние."""
    online = status_printer()
    set_printer_online(online)

    return jsonify({"printerOnline": online})


@app.get("/lisPtrinters")
def list_printers_route():
    return jsonify({"listPrinters": list_printers()})


@app.post("/print-label")
def print_label_route():
    body = request.get_json(silent=True)

    if not isinstance(body, dict):
        return jsonify({"error": "Ожидается JSON-объект"}), 400

    if not get_printer_online():
        return jsonify({
            "status": False,
            "error": "Принтер недоступен",
        }), 503

    try:
        with _print_lock:
            print_label(body)

        return jsonify({"status": True})

    except LabelRequestError as error:
        return jsonify({"error": str(error)}), 400

    except PrinterNotConfiguredError as error:
        return jsonify({"error": str(error)}), 400

    except Exception:
        app.logger.exception("Ошибка печати этикетки")
        return jsonify({"error": "Ошибка печати этикетки"}), 500


@app.post("/print-number")
@app.post("/ozon-shelf")
def print_number_route():
    body = request.get_json(silent=True)

    if not isinstance(body, dict):
        return "OK"

    text = body.get("text")

    if not isinstance(text, str):
        return "OK"

    text = text.strip()

    if not text:
        return "OK"

    # В standalone проверяем состояние перед каждым заданием.
    # В обычном режиме используем кеш из /status-printer.
    if STANDALONE:
        online = status_printer()
        set_printer_online(online)
    else:
        online = get_printer_online()

    if not online:
        return "OK"

    try:
        with _print_lock:
            print_text(text)

        return "OK"

    except Exception:
        app.logger.exception("Ошибка автоматической печати")
        return jsonify({"error": "Ошибка печати"}), 500


if __name__ == "__main__":
    # make_server позволяет штатно остановить цикл serve_forever().
    _server = make_server(
        "127.0.0.1",
        5000,
        app,
        threaded=True,
    )

    if STANDALONE:
        print("Запуск в standalone-режиме")
        print("Автоматическое завершение по простою отключено")
    else:
        print(
            f"Запуск с автоматическим завершением "
            f"через {TIMEOUT} секунд простоя"
        )

    threading.Thread(
        target=watchdog,
        daemon=True,
    ).start()

    try:
        _server.serve_forever()
    finally:
        _server.server_close()
        print("HTTP-сервер остановлен")
