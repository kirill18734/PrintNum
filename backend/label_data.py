"""Совместимые импорты функций проверки запросов печати этикеток."""

from app.domain.label_data import (
    LabelRequestError,
    PrintNumberRequestError,
    parse_label_request,
    parse_print_number_request,
)

__all__ = [
    "LabelRequestError",
    "PrintNumberRequestError",
    "parse_label_request",
    "parse_print_number_request",
]
