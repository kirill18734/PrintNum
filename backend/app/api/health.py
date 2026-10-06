"""Маршрут проверки доступности уже запущенного бэкенда."""

from flask import Blueprint, jsonify


blueprint = Blueprint("health", __name__)


@blueprint.get("/")
def health():
    return jsonify({"status": True})
