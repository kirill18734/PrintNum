import threading

from flask import Flask, request, jsonify
from flask_cors import CORS  # Импортируем CORS
from data import load_config, save_config
import win32print

from print_text import print_text, status_printer
from screen_find_text_neiro import select_area, show_area, main_neiro


def list_printers():
    flags = win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS
    printers = win32print.EnumPrinters(flags)

    # В каждом кортеже третий элемент — это имя принтера
    printer_names = [p[2] for p in printers]
    return printer_names

app = Flask(__name__)
CORS(app)  # Включаем CORS для всего приложения

@app.route('/run', methods=['POST'])
def receive_data():
    try:
        config = load_config()
        config['printer'] = config['printer'] if config['printer'] in list_printers() else ''
        save_config(config)
        data = {
            "theme": config["theme"],
            "mode": config["mode"],
            "printer": config['printer'],
            "is_running": config["is_running"]
        }
        return jsonify({"status": "success", "body": data}), 200  # Возвращаем ответ
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500  # Обработка ошибок

@app.route('/change_them', methods=['POST'])
def receive_data_them():
    config = load_config()
    config['theme'] = 'light' if config['theme'] == 'night' else 'night'
    save_config(config)
    data = {
        "theme": config['theme'],
    }
    return jsonify({"status": "success", "body": data}), 200  # Возвращаем ответ

@app.route('/change_mode', methods=['POST'])
def receive_data_mode():
    config = load_config()
    config['mode'] = 'neiro' if config['mode'] == 'expansion' else 'expansion'
    save_config(config)
    data = {
        "mode": config['mode'],
    }
    return jsonify({"status": "success", "body": data}), 200  # Возвращаем ответ

@app.route('/get_list_printers', methods=['POST'])
def receive_data_get_list_printers():
    config = load_config()
    config['printer'] = config['printer'] if config['printer'] in list_printers() else ''
    save_config(config)
    data = {
        "default": config['printer'],
        "printers": list_printers(),
    }
    return jsonify({"status": "success", "body": data}), 200  # Возвращаем ответ


@app.route('/set_printer', methods=['POST'])
def set_printer():
    # получаем тело запроса как строку
    new_printer = request.data.decode("utf-8").strip()

    config = load_config()
    config['printer'] = new_printer
    save_config(config)

    # возвращаем обновлённый список с дефолтным принтером
    data = {
        "default": new_printer,
        "printers": list_printers()
    }
    return jsonify({"status": "success", "body": data}), 200

@app.route('/run_app', methods=['POST'])
def set_run_app():
    config = load_config()
    config['is_running'] = False if config['is_running'] else True
    save_config(config)
    data = {
        "is_running": config['is_running']
    }
    return jsonify({"status": "success", "body": data}), 200  # Возвращаем ответ

@app.route('/print_number', methods=['POST'])
def print_number():
    new_number = request.data.decode("utf-8").strip()
    if load_config()['is_running']:
        print_text(new_number)
    return 'OK'
@app.route('/show_area', methods=['POST'])
def showarea():
    show_area()
    return 'OK'

@app.route('/set_area', methods=['POST'])
def set_area():
    select_area()
    return 'OK'

@app.route('/check_state_printer', methods=['POST'])
def state_printer():
    print(jsonify({"status": "success", "body": status_printer()}))
    return jsonify({"status": "success", "body": status_printer()}), 200  # Возвращаем ответ

def run_flask():
    app.run(host='127.0.0.1', port=load_config()['port'])

if __name__ == '__main__':
    # Создаем поток для Flask
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()

    # Создаем поток для другой функции
    other_thread = threading.Thread(target=main_neiro)
    other_thread.start()

    # При желании можно ждать завершения потоков
    flask_thread.join()
    other_thread.join()
