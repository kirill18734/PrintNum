import os
import time
import threading

from flask import Flask, request, jsonify
from flask_cors import CORS
from data import  listPapers, save_config,load_config
from utils import listPrinters,status_printer
from print_text import print_text

app = Flask(__name__)
CORS(app)  # Включаем CORS для всего приложения

# Время последнего запроса
last_request_time = time.time()

# Через сколько секунд убивать сервер
TIMEOUT = 15

printerOnline = False

@app.before_request
def update_activity():
    """
    Обновляем время активности
    перед каждым запросом
    """
    global last_request_time

    last_request_time = time.time()

def watchdog():
    """
    Следит за неактивностью
    """
    global last_request_time

    while True:
        inactive_time = time.time() - last_request_time

        if inactive_time > TIMEOUT:
            print(f"Нет запросов {TIMEOUT} секунд")
            print("Flask сервер завершен")
        
            os._exit(0)

        time.sleep(1)

@app.get("/")
def hello_world():
      return jsonify({"status": True})

@app.get("/get-config")
@app.get("/get-config/<config_key>")
def getConfig(config_key=None):
    config = load_config()
    if not config_key:
        return  jsonify({
            **config,
            "listPrinters": listPrinters(),
            "listPapers": listPapers
        })
    return  jsonify({config_key: config.get(config_key)})

@app.post("/set-config")
def setConfig():
    body = request.get_json()  
    config = load_config().copy()
    new_config = {**config, **body}
    save_config(new_config)
    return "OK"

@app.get('/status-printer')
def statusPrinter():
    global printerOnline
    printerOnline = status_printer()
    return jsonify({'printerOnline': printerOnline})

@app.post('/print-number')
def printNumber():
    body = request.get_json()
    config = load_config().copy()
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