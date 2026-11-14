"""HTTP API для локального PrintNum backend."""

import base64
import threading
import time
from collections import deque
from datetime import datetime, timezone

from flask import jsonify, request

from app.auto_print import print_text
from app.config import load_config
from app.label_print import LabelRequestError, PrinterNotConfiguredError, print_label
from app.resources import get_font_data, get_fonts, get_images, get_resource_versions
from app.utils import find_excluded_rule, list_printers, status_printer

PRINTER_STATUS_CACHE_SECONDS = 2
PRINTER_LIST_CACHE_SECONDS = 5
MAX_PRINT_JOBS = 30

_state_lock = threading.Lock()
_print_lock = threading.Lock()
_printer_online = False
_last_printer_check = 0.0
_printers = []
_last_printer_list_check = 0.0
_printer_list_initialized = False
_printers_version = 0
_fonts_version = 0
_backgrounds_version = 0
_last_fonts_signature = None
_last_backgrounds_signature = None
_print_jobs = deque(maxlen=MAX_PRINT_JOBS)


def get_printer_online():
    with _state_lock:
        return _printer_online


def set_printer_online(value):
    global _printer_online
    with _state_lock:
        _printer_online = bool(value)


def _refresh_printer_status(force=False):
    global _printer_online, _last_printer_check
    now = time.monotonic()
    with _state_lock:
        should_check = force or now - _last_printer_check >= PRINTER_STATUS_CACHE_SECONDS
    if should_check:
        online = status_printer()
        with _state_lock:
            _printer_online = bool(online)
            _last_printer_check = now
    return get_printer_online()


def _refresh_printer_list(force=False):
    """Обновляет список принтеров не чаще заданного интервала."""
    global _printers, _last_printer_list_check
    global _printer_list_initialized, _printers_version

    now = time.monotonic()
    with _state_lock:
        should_check = (
            force
            or not _printer_list_initialized
            or now - _last_printer_list_check >= PRINTER_LIST_CACHE_SECONDS
        )
        if not should_check:
            return list(_printers)

        _last_printer_list_check = now

    try:
        printers = list_printers()
    except Exception:
        # При временной ошибке Windows API сохраняем последний успешный список.
        return get_printers()

    with _state_lock:
        if not _printer_list_initialized or printers != _printers:
            _printers = printers
            _printers_version += 1
        _printer_list_initialized = True
        return list(_printers)


def get_printers():
    with _state_lock:
        return list(_printers)


def _get_resource_versions():
    global _fonts_version, _backgrounds_version
    global _last_fonts_signature, _last_backgrounds_signature

    fonts_signature, backgrounds_signature = get_resource_versions()
    with _state_lock:
        if fonts_signature != _last_fonts_signature:
            _fonts_version += 1
            _last_fonts_signature = fonts_signature
        if backgrounds_signature != _last_backgrounds_signature:
            _backgrounds_version += 1
            _last_backgrounds_signature = backgrounds_signature
        return _fonts_version, _backgrounds_version


def _add_print_job(text, status):
    with _state_lock:
        _print_jobs.appendleft({
            "text": text,
            "status": status,
            "receivedAt": datetime.now(timezone.utc).isoformat(),
        })


def _get_print_jobs():
    with _state_lock:
        return list(_print_jobs)


def register_routes(app, shutdown_requested):
    """Регистрирует HTTP-маршруты API."""

    @app.get("/")
    def hello_world():
        return jsonify({"status": True})

    @app.post("/shutdown")
    def shutdown_route():
        if request.remote_addr not in ("127.0.0.1", "::1"):
            return jsonify({"status": False, "error": "Доступ запрещён"}), 403
        if request.headers.get("X-PrintNum-Shutdown") != "local-client":
            return jsonify({"status": False, "error": "Отсутствует заголовок остановки"}), 403
        shutdown_requested.set()
        return jsonify({"status": True, "message": "Запрошена остановка сервера"})

    @app.get("/data-app")
    def data_app_route():
        _refresh_printer_list()
        fonts_version, backgrounds_version = _get_resource_versions()
        with _state_lock:
            printers_version = _printers_version

        return jsonify({
            "fontsVersion": fonts_version,
            "backgroundsVersion": backgrounds_version,
            "printersVersion": printers_version,
            "onlinePrinter": _refresh_printer_status(),
            "printJobs": _get_print_jobs(),
        })

    @app.get("/fonts")
    def fonts_route():
        fonts = [{
            **font,
            "base64": base64.b64encode(get_font_data(font["id"])).decode("ascii"),
        } for font in get_fonts()]
        return jsonify({"dataFonts": fonts})

    @app.get("/backgrounds")
    def backgrounds_route():
        backgrounds = [{
            "id": image["id"],
            "name": image["name"],
            "base64": base64.b64encode(image["data"]).decode("ascii"),
        } for image in get_images()]
        return jsonify({"dataBackgrounds": backgrounds})

    @app.get("/printers")
    def printers_route():
        return jsonify({"listPrinters": _refresh_printer_list()})

    @app.get("/status-printer")
    def status_printer_route():
        return jsonify({"printerOnline": _refresh_printer_status(force=True)})

    @app.get("/listPrinters")
    def list_printers_route():
        try:
            return jsonify({"listPrinters": _refresh_printer_list(force=True)})
        except Exception:
            app.logger.exception("Не удалось получить список принтеров")
            return jsonify({"message": "Не удалось получить список принтеров"}), 500

    @app.post("/print-label")
    def print_label_route():
        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            return jsonify({"message": "Ожидается JSON-объект"}), 400
        if not get_printer_online():
            _add_print_job(body.get("content"), "printer_unavailable")
            return jsonify({"status": False, "message": "Принтер недоступен"}), 503
        try:
            with _print_lock:
                print_label(body)
            _add_print_job(body.get("content"), "printed")
            return jsonify({"status": True})
        except LabelRequestError as error:
            return jsonify({"message": str(error)}), 400
        except PrinterNotConfiguredError as error:
            return jsonify({"message": str(error)}), 400
        except Exception:
            app.logger.exception("Ошибка печати этикетки")
            _add_print_job(body.get("content"), "print_error")
            return jsonify({"message": "Ошибка печати этикетки"}), 500

    @app.post("/print-number")
    @app.post("/ozon-shelf")
    def print_number_route():
        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            return "OK"
        text = body.get("text")
        if not isinstance(text, str) or not text.strip():
            return "OK"
        text = text.strip()
        config = load_config()
        if find_excluded_rule(text, config.get("excludedTexts", [])):
            _add_print_job(text, "excluded")
            return "OK"

        online = (
            _refresh_printer_status(force=True)
            if app.config.get("PRINTNUM_STANDALONE")
            else get_printer_online()
        )
        if not online:
            _add_print_job(text, "printer_unavailable")
            return "OK"

        try:
            with _print_lock:
                print_text(text)
            _add_print_job(text, "printed")
            return "OK"
        except Exception:
            app.logger.exception("Ошибка автоматической печати")
            _add_print_job(text, "print_error")
            return jsonify({"error": "Ошибка печати"}), 500
