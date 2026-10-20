"""HTTP-маршрут проверки и отправки созданных вручную этикеток на печать."""

import logging

from flask import Blueprint, current_app, jsonify, request

from app.domain.label_data import LabelRequestError
from app.services.label_service import (
    PrinterNotConfiguredError,
    PrinterUnavailableError,
)


logger = logging.getLogger(__name__)
blueprint = Blueprint("labels", __name__)


@blueprint.post("/print-label")
def print_label():
    services = current_app.extensions["printnum"]
    try:
        services["labels"].print_label(request.get_json(silent=True))
    except LabelRequestError as error:
        return jsonify({"error": str(error)}), 400
    except PrinterNotConfiguredError as error:
        return jsonify({"error": str(error)}), 409
    except PrinterUnavailableError as error:
        return jsonify({"error": str(error)}), 503
    except Exception:
        logger.exception("Не удалось напечатать этикетку")
        return jsonify({"error": "Не удалось отправить этикетку на принтер"}), 500

    return jsonify({"status": "printed"})
