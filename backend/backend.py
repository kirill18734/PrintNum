from flask import Flask, request, jsonify
from data import load_config
from utils import listPrinters, status_printer
from print_text import print_text

app = Flask(__name__)

@app.get('/')
def status():
    return jsonify({"status": "ok"})

@app.post('/print-number')
def print_number():
    body = request.get_json()
    config = load_config().copy()
    printerOnline = status_printer()
    if not printerOnline: 
        print(f"Принтер Недоступен '{config.get('printer')}'") 
        return 'OK'
    text = body.get("text").strip()
    if (text):
        print_text(text)
    return "OK"

if __name__ == "__main__":
    app.run()