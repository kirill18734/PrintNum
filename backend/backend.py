"""Совместимая точка входа, сохранённая для существующих сборок PyInstaller."""

import logging

from run import run_server


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_server()