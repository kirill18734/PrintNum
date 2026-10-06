"""Совместимые функции печати, использующие модуль отрисовки Windows."""

from app.domain.label_layout import prepare_label_data
from app.infrastructure.windows_rendering import (
    render_manual_label,
    render_number_label,
)
from data import load_config


def print_text(text, config=None):
    render_number_label(text, config if config is not None else load_config())


def print_label(
    content,
    content_type,
    code_image,
    config,
    bold=False,
    underline=False,
    show_code_text=False,
):
    render_manual_label(
        content,
        content_type,
        code_image,
        config,
        bold=bold,
        underline=underline,
        show_code_text=show_code_text,
    )


__all__ = ["prepare_label_data", "print_label", "print_text"]
