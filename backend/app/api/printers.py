"""HTTP-маршруты получения списка принтеров и проверки их готовности."""

import logging

from flask import Blueprint, current_app, jsonify


logger = logging.getLogger(__name__)
blueprint = Blueprint("printers", __name__)


@blueprint.get("/status-printer")
def printer_status():
    services = current_app.extensions["printnum"]
    config = services["config"].load()
    printer_name = config.get("printer")
    try:
        online = services["printers"].is_online(printer_name)
    except Exception:
        logger.exception("Не удалось проверить состояние принтера")
        return jsonify({"error": "Не удалось проверить состояние принтера"}), 500
    return jsonify({"printerOnline": online})


@blueprint.get("/listPrinters")
def list_printers():
    services = current_app.extensions["printnum"]
    try:
        printers = services["printers"].list_printers()
    except Exception:
        logger.exception("Не удалось получить список принтеров")
        return jsonify({"error": "Не удалось получить список принтеров"}), 500
    return jsonify({"listPrinters": printers})
