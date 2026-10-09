"""HTTP-маршрут приёма заданий автопечати."""

import logging

from flask import Blueprint, current_app, jsonify, request

from app.domain.label_data import PrintNumberRequestError, parse_print_number_request


logger = logging.getLogger(__name__)
blueprint = Blueprint("auto_print", __name__)


@blueprint.get("/auto-print-status")
def auto_print_status():
    services = current_app.extensions["printnum"]
    return jsonify({"event": services["auto_print_status"].latest()})


@blueprint.post("/print-number")
def print_number():
    try:
        text = parse_print_number_request(request.get_json(silent=True))
    except PrintNumberRequestError as error:
        return jsonify({"error": str(error)}), 400

    services = current_app.extensions["printnum"]
    event_id = services["auto_print_status"].start(text)
    try:
        result = services["auto_print"].process(text)
    except Exception:
        services["auto_print_status"].fail(event_id)
        logger.exception("Не удалось обработать запрос автопечати")
        return jsonify({"error": "Не удалось отправить этикетку на принтер"}), 500

    services["auto_print_status"].finish(event_id, result)
    if result["status"] == "skipped":
        return jsonify({"status": result["status"], "rule": result["rule"]})
    return "OK"
