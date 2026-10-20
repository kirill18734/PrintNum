"""Создаёт и настраивает приложение Flask и связанные с ним сервисы."""

import logging

from flask import Flask, jsonify
from flask_cors import CORS

from app.api.auto_print import blueprint as auto_print_blueprint
from app.api.health import blueprint as health_blueprint
from app.api.labels import blueprint as labels_blueprint
from app.api.lifecycle import blueprint as lifecycle_blueprint
from app.api.printers import blueprint as printers_blueprint
from app.domain.label_data import MAX_CODE_IMAGE_SIZE
from app.infrastructure.config_repository import ConfigRepository
from app.infrastructure.runtime_activity import RuntimeActivity
from app.infrastructure.windows_printer import WindowsPrinterAdapter
from app.services.auto_print_service import AutoPrintService
from app.services.auto_print_status import AutoPrintStatus
from app.services.label_service import LabelService
from app.services.printer_service import PrinterService


def create_app(
    config_repository=None,
    printer_adapter=None,
    idle_timeout=10,
    enable_cors=True,
):
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_CODE_IMAGE_SIZE + 2 * 1024 * 1024
    app.logger.setLevel(logging.INFO)

    repository = config_repository or ConfigRepository()
    printer = PrinterService(printer_adapter or WindowsPrinterAdapter())
    auto_print_status = AutoPrintStatus()
    activity = RuntimeActivity(idle_timeout=idle_timeout)

    app.extensions["printnum"] = {
        "config": repository,
        "printers": printer,
        "auto_print": AutoPrintService(repository, printer),
        "auto_print_status": auto_print_status,
        "labels": LabelService(repository, printer),
        "activity": activity,
    }

    if enable_cors:
        CORS(app)

    @app.before_request
    def record_request_activity():
        activity.begin_request()

    @app.teardown_request
    def finish_request(_error):
        activity.end_request()

    @app.errorhandler(413)
    def request_too_large(_error):
        return jsonify({"error": "Размер запроса превышает 6 МБ"}), 413

    app.register_blueprint(health_blueprint)
    app.register_blueprint(printers_blueprint)
    app.register_blueprint(auto_print_blueprint)
    app.register_blueprint(labels_blueprint)
    app.register_blueprint(lifecycle_blueprint)
    return app
