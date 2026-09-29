import os
import time
import threading

from flask import Flask, request, jsonify
from flask_cors import CORS
from data import load_config
from utils import listPrinters, status_printer
from print_text import print_text

app = Flask(__name__)
CORS(app)  # Включаем CORS для всего приложения

@app.get('/')
def status():
    return jsonify({"status": "ok"})

@app.post('/print-number')
def printNumber():
    body = request.get_json()
    config = load_config().copy()
    printerOnline = status_printer()
    text = body.get("text").strip()
    if (text) and config.get('running') and config.get('printer') and printerOnline:
        print_text(text)
    return "OK"

if __name__ == "__main__":
    # Запускаем watchdog
    threading.Thread(
        target=watchdog,
        daemon=True
    ).start()

    app.run()