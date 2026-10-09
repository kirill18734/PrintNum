"""HTTP-маршрут приёма заданий автопечати."""

import logging

from flask import Blueprint, current_app, jsonify, request

from app.domain.label_data import PrintNumberRequestError, parse_print_number_request


logger = logging.getLogger(__name__)
blueprint = Blueprint("auto_print", __name__)


@blueprint.post("/print-number")
def print_number():
    try:
        text = parse_print_number_request(request.get_json(silent=True))
    except PrintNumberRequestError as error:
        return jsonify({"error": str(error)}), 400

    services = current_app.extensions["printnum"]
    try:
        result = services["auto_print"].process(text)
    except Exception:
        logger.exception("Не удалось обработать запрос автопечати")
        return jsonify({"error": "Не удалось отправить этикетку на принтер"}), 500

    if result["status"] == "skipped":
        return jsonify(result)
    return "OK"
