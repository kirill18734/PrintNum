import sys
import time
import threading

from flask import Flask
from flask_cors import CORS
from werkzeug.serving import make_server

from app.config import load_config
from app.resources import init_resources, shutdown_resources
from app.routes import register_routes

TIMEOUT = 10
STANDALONE = "--standalone" in sys.argv

app = Flask(__name__)
app.config["PRINTNUM_STANDALONE"] = STANDALONE
CORS(app)

_state_lock = threading.Lock()
_last_request_time = time.monotonic()
_shutdown_requested = threading.Event()
_server = None

register_routes(app, _shutdown_requested)


@app.before_request
def update_activity():
    """Обновляет время активности приложения."""
    global _last_request_time
    with _state_lock:
        _last_request_time = time.monotonic()


def watchdog():
    """Завершает сервер по запросу или после тайм-аута простоя."""
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
                f"(пропущено {actual_elapsed:.1f} сек). Сброс таймера активности."
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


if __name__ == "__main__":
    try:
        load_config()
        print("Инициализация ресурсов...")
        init_resources()

        _server = make_server("127.0.0.1", 5000, app, threaded=True)
        if STANDALONE:
            print("Запуск в standalone-режиме")
            print("Автоматическое завершение по простою отключено")
        else:
            print(f"Запуск с автоматическим завершением через {TIMEOUT} секунд простоя")

        threading.Thread(target=watchdog, daemon=True).start()
        _server.serve_forever()

    except KeyboardInterrupt:
        print("Получен сигнал завершения")
    finally:
        print("Завершение приложения...")
        if _server is not None:
            _server.server_close()
        shutdown_resources()
        print("Приложение завершено")
