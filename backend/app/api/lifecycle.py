"""Локальный маршрут для запроса штатной остановки бэкенда."""

import ipaddress

from flask import Blueprint, current_app, jsonify, request


blueprint = Blueprint("lifecycle", __name__)
ALLOWED_ORIGINS = {
    "http://localhost:1420",
    "http://127.0.0.1:1420",
    "http://tauri.localhost",
    "https://tauri.localhost",
    "tauri://localhost",
}


@blueprint.post("/shutdown")
def shutdown():
    origin = request.headers.get("Origin")
    if origin is not None and origin not in ALLOWED_ORIGINS:
        return jsonify({"error": "Недопустимый источник запроса"}), 403

    try:
        remote_address = ipaddress.ip_address(request.remote_addr or "")
    except ValueError:
        return jsonify({"error": "Остановка разрешена только с локального компьютера"}), 403
    if not remote_address.is_loopback:
        return jsonify({"error": "Остановка разрешена только с локального компьютера"}), 403
    if request.headers.get("X-PrintNum-Shutdown") != "local-client":
        return jsonify({"error": "Не указан маркер штатной остановки"}), 403

    current_app.extensions["printnum"]["activity"].request_shutdown()
    return jsonify({"status": "shutting-down"}), 202
