import sys
import time
import threading
from datetime import datetime

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
from app.config import load_config

from app.resources import (
    init_resources,
    shutdown_resources,
)


app = Flask(__name__)
CORS(app)

TIMEOUT = 10
STANDALONE = "--standalone" in sys.argv

PRINTER_STATUS_INTERVAL = 1
PRINTER_LIST_INTERVAL = 5
PRINT_QUEUE_LIMIT = 100

# Единое состояние, которое читается frontend через /printer-data.
printer_data = {
    "listPrinters": [],
    "printerOnline": False,
    "printQueue": [],
}

# Защита состояния, последовательное выполнение печати и остановка потоков.
_state_lock = threading.Lock()
_print_lock = threading.Lock()
_monitor_stop_requested = threading.Event()
_monitor_threads = []

_last_request_time = time.monotonic()
_shutdown_requested = threading.Event()
_server = None


def _get_printer_online():
    with _state_lock:
        return printer_data["printerOnline"]


def _set_printer_online(value):
    with _state_lock:
        printer_data["printerOnline"] = bool(value)


def _register_print_job(text):
    """Добавляет поступивший текст в историю обработки."""
    job = {
        "status": "processing",
        "text": text,
        "renameText": None,
        "receivedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
    }

    with _state_lock:
        jobs = printer_data["printQueue"]
        jobs.insert(0, job)

        if len(jobs) > PRINT_QUEUE_LIMIT:
            del jobs[PRINT_QUEUE_LIMIT:]

    return job


def _set_print_job_status(job, status, rename_text=None):
    """Обновляет статус задания, не меняя исходный текст и время получения."""
    with _state_lock:
        job["status"] = status

        if rename_text is not None:
            job["renameText"] = rename_text


def _get_printer_data():
    """Возвращает согласованную копию состояния для HTTP-ответа."""
    with _state_lock:
        jobs = [
            {
                "status": job["status"],
                "text": job["text"],
                "renameText": job["renameText"],
                "receivedAt": job["receivedAt"],
            }
            for job in printer_data["printQueue"]
        ]

        if not jobs:
            jobs = [{
                "status": "waiting",
                "text": None,
                "renameText": None,
                "receivedAt": None,
            }]

        return {
            "listPrinters": list(printer_data["listPrinters"]),
            "printerOnline": printer_data["printerOnline"],
            "printQueue": jobs,
        }


def _refresh_printer_status():
    """Обновляет кеш состояния выбранного принтера."""
    try:
        online = status_printer()
    except Exception:
        app.logger.exception("Не удалось проверить состояние принтера")
        online = False

    _set_printer_online(online)


def _refresh_printer_list():
    """Обновляет кеш списка принтеров, сохраняя последнее успешное значение при ошибке."""
    try:
        printers = list_printers()
    except Exception:
        app.logger.exception("Не удалось получить список принтеров")
        return

    with _state_lock:
        if printers != printer_data["listPrinters"]:
            printer_data["listPrinters"] = list(printers)


def _printer_status_monitor():
    while not _monitor_stop_requested.wait(PRINTER_STATUS_INTERVAL):
        _refresh_printer_status()


def _printer_list_monitor():
    while not _monitor_stop_requested.wait(PRINTER_LIST_INTERVAL):
        _refresh_printer_list()


def _start_background_monitors():
    """Сначала заполняет начальное состояние, затем запускает независимые мониторы."""
    _refresh_printer_status()
    _refresh_printer_list()

    monitors = (
        ("printer_status_monitor", _printer_status_monitor),
        ("printer_list_monitor", _printer_list_monitor),
    )

    for name, target in monitors:
        thread = threading.Thread(
            target=target,
            name=name,
            daemon=True,
        )
        _monitor_threads.append(thread)
        thread.start()


def _stop_background_monitors():
    _monitor_stop_requested.set()

    for thread in _monitor_threads:
        if thread.is_alive():
            thread.join(timeout=PRINTER_LIST_INTERVAL + 1)

    _monitor_threads.clear()


@app.before_request
def update_activity():
    """Обновляет время активности приложения."""
    global _last_request_time

    with _state_lock:
        _last_request_time = time.monotonic()


def watchdog():
    """Останавливает сервер по запросу или тайм-ауту простоя."""
    global _last_request_time

    while True:
        loop_start = time.monotonic()

        if _shutdown_requested.wait(1):
            print("Получен запрос на остановку сервера")
            break

        actual_elapsed = time.monotonic() - loop_start
        if actual_elapsed > 2.0:
            print(
                "Обнаружено пробуждение ПК из спящего режима "
                f"(пропущено {actual_elapsed:.1f} сек). "
                "Сброс таймера активности."
            )
            with _state_lock:
                _last_request_time = time.monotonic()
            continue

        if STANDALONE:
            continue

        with _state_lock:
            inactive_time = time.monotonic() - _last_request_time

        if inactive_time > TIMEOUT:
            print(f"Нет запросов {TIMEOUT} секунд")
            break

    print("Остановка Flask-сервера")

    if _server is not None:
        _server.shutdown()


@app.get("/")
def hello_world():
    return jsonify({"status": True})


@app.post("/shutdown")
def shutdown_route():
    """Запрашивает штатную остановку HTTP-сервера."""
    if request.remote_addr not in ("127.0.0.1", "::1"):
        return jsonify({
            "status": False,
            "error": "Доступ запрещён",
        }), 403

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


@app.get("/printer-data")
def printer_data_route():
    """Возвращает готовое состояние принтера и историю текстовых заданий."""
    return jsonify(_get_printer_data())


@app.post("/print-label")
def print_label_route():
    body = request.get_json(silent=True)

    if not isinstance(body, dict):
        return jsonify({"error": "Ожидается JSON-объект"}), 400

    if not _get_printer_online():
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

    # Регистрируем задание до проверок, чтобы frontend сразу видел processing.
    job = _register_print_job(text)

    # Проверяем принтер непосредственно при поступлении каждого текста.
    # Не используем кеш фонового монитора для принятия решения о печати.
    try:
        online = status_printer()
    except Exception:
        app.logger.exception("Ошибка непосредственной проверки принтера")
        online = False

    _set_printer_online(online)

    if not online:
        _set_print_job_status(job, "printer_unavailable")
        return "OK"

    try:
        with _print_lock:
            printed = print_text(text)

        _set_print_job_status(
            job,
            "excluded" if printed is False else "printed",
        )

        return "OK"

    except Exception:
        _set_print_job_status(job, "print_error")
        app.logger.exception("Ошибка автоматической печати")
        return jsonify({"error": "Ошибка печати"}), 500


if __name__ == "__main__":
    try:
        load_config()

        print("Инициализация ресурсов...")
        init_resources()

        # Первичное состояние и фоновые мониторы запускаются до Flask.
        _start_background_monitors()

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
            name="backend_watchdog",
            daemon=True,
        ).start()

        _server.serve_forever()

    except KeyboardInterrupt:
        print("Получен сигнал завершения")

    finally:
        print("Завершение приложения...")

        # Сначала останавливаем мониторинг, затем закрываем ресурсы.
        _stop_background_monitors()

        if _server is not None:
            _server.server_close()

        shutdown_resources()

        print("Приложение завершено")
