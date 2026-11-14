import sys
import time
import threading
import uuid
from collections import deque
from datetime import datetime, timezone

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
from app.config import load_config, save_config

from app.resources import (
    init_resources,
    shutdown_resources,
    load_font,
    get_font_name,
    get_image,
    resource_session,
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
_print_jobs = deque(maxlen=20)

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


def record_print_job(job_id, status, text):
    """Добавляет или обновляет запись задания для общего состояния UI."""
    job = {
        "status": status,
        "text": text,
        "receivedAt": datetime.now(timezone.utc).isoformat(),
    }

    with _state_lock:
        for existing in list(_print_jobs):
            if existing.get("id") == job_id:
                _print_jobs.remove(existing)
        job["id"] = job_id
        _print_jobs.appendleft(job)


def watchdog():
    """Останавливает сервер по запросу или тайм-ауту простоя с защитой от спящего режима."""
    global _last_request_time
    
    while True:
        # Фиксируем время перед уходом в ожидание
        loop_start = time.monotonic()
        
        # Ожидание запроса остановки не блокирует её обработку дольше одной секунды.
        if _shutdown_requested.wait(1):
            print("Получен запрос на остановку сервера")
            break

        # Вычисляем, сколько реального времени прошло за одну итерацию .wait(1).
        # Если прошло сильно больше 1.5-2 секунд, значит ПК спал.
        actual_elapsed = time.monotonic() - loop_start
        if actual_elapsed > 2.0:
            print(f"Обнаружено пробуждение ПК из спящего режима (пропущено {actual_elapsed:.1f} сек). Сброс таймера активности.")
            with _state_lock:
                _last_request_time = time.monotonic()
            continue

        # В автономном режиме тайм-аут отключён, но запрос /shutdown продолжает работать.
        if STANDALONE:
            continue

        with _state_lock:
            inactive_time = time.monotonic() - _last_request_time

        if inactive_time > TIMEOUT:
            print(f"Нет запросов {TIMEOUT} секунд")
            break

    print("Остановка Flask-сервера")

    if _server is not None:
        # shutdown() вызывается из watchdog-потока, а serve_forever() работает в основном потоке.
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

@app.get("/state")
def app_state_route():
    """Единый снимок состояния для интерфейса: принтер, список устройств и задания."""
    online = status_printer()
    set_printer_online(online)

    try:
        printers = list_printers()
    except Exception:
        app.logger.exception("Не удалось получить список принтеров")
        printers = []

    with _state_lock:
        jobs = [
            {key: value for key, value in job.items() if key != "id"}
            for job in _print_jobs
        ]

    return jsonify({
        "printerOnline": online,
        "listPrinters": printers,
        "printJobs": jobs,
    })


@app.post("/print-label")
def print_label_route():
    body = request.get_json(silent=True)

    if not isinstance(body, dict):
        return jsonify({"error": "Ожидается JSON-объект"}), 400

    job_id = uuid.uuid4().hex
    job_text = str(body.get("content", ""))

    if not get_printer_online():
        record_print_job(job_id, "printer_unavailable", job_text)
        return jsonify({
            "status": False,
            "error": "Принтер недоступен",
        }), 503

    record_print_job(job_id, "processing", job_text)

    try:
        with _print_lock:
            print_label(body)

        record_print_job(job_id, "printed", job_text)
        return jsonify({"status": True})

    except LabelRequestError as error:
        record_print_job(job_id, "print_error", job_text)
        return jsonify({"error": str(error)}), 400

    except PrinterNotConfiguredError as error:
        record_print_job(job_id, "printer_unavailable", job_text)
        return jsonify({"error": str(error)}), 400

    except Exception:
        record_print_job(job_id, "print_error", job_text)
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

    job_id = uuid.uuid4().hex

    if not online:
        record_print_job(job_id, "printer_unavailable", text)
        return "OK"

    record_print_job(job_id, "processing", text)

    try:
        with _print_lock:
            printed = print_text(text)

        record_print_job(
            job_id,
            "printed" if printed is not False else "excluded",
            text,
        )
        return "OK"

    except Exception:
        record_print_job(job_id, "print_error", text)
        app.logger.exception("Ошибка автоматической печати")
        return jsonify({"error": "Ошибка печати"}), 500


if __name__ == "__main__":
    try:
        # 1. Загружаем конфигурацию.
        config = load_config()

        # 2. Загружаем все шрифты и изображения в RAM.
        print("Инициализация ресурсов...")
        init_resources()

        # 3. Создаём HTTP-сервер.
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

        # 4. Запускаем сервер.
        _server.serve_forever()

    except KeyboardInterrupt:
        print("Получен сигнал завершения")

    finally:
        print("Завершение приложения...")

        # 5. Закрываем HTTP-сервер.
        if _server is not None:
            _server.server_close()

        # 6. Освобождаем зарегистрированные шрифты и кеш.
        shutdown_resources()

        print("Приложение завершено")