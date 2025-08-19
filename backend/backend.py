import threading

from flask import Flask, request, jsonify
from flask_cors import CORS  # Импортируем CORS
from data import load_config, save_config, list_printers

from print_text import print_text, status_printer
from screen_find_text_neiro import select_area, show_area, main_neiro

app = Flask(__name__)
CORS(app)  # Включаем CORS для всего приложения


@app.route('/', methods=["GET"])
def runserver():
    return "Сервер запущен"


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
        if load_config()['is_running'] and load_config()['mode'] == 'neiro':
            # Создаем поток для другой функции
            other_thread2 = threading.Thread(target=main_neiro)
            other_thread2.start()
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
    config['mode'] = 'neiro' if config['mode'] == 'extension' else 'extension'
    save_config(config)
    data = {
        "mode": config['mode'],
    }
    if load_config()['is_running'] and load_config()['mode'] == 'neiro':
        # Создаем поток для другой функции
        other_thread2 = threading.Thread(target=main_neiro)
        other_thread2.start()
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


@app.route('/print_number', methods=['POST'])
def print_from_data():
    try:
        new_number = request.data.decode("utf-8").strip()
        config = load_config()
        if config['is_running'] and config['mode'] == 'extension':
            print("📥 Пришли данные:", new_number)
            if not new_number:
                return jsonify({'status': 'error', 'message': 'Empty text'}), 400
            print_text(new_number)
            return jsonify({'status': 'success', 'message': f'Printed: {new_number}'})
        else:
            # Возвращаем ответ, если условие не выполнено
            return jsonify({'status': 'error', 'message': 'Service is not running or wrong mode'}), 400
    except Exception as e:
        print("❌ Ошибка во Flask-приложении:", e)
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/run_app', methods=['POST'])
def set_run_app():
    config = load_config()
    config['is_running'] = False if config['is_running'] else True
    save_config(config)
    data = {
        "is_running": config['is_running']
    }
    return jsonify({"status": "success", "body": data}), 200  # Возвращаем ответ


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
    config = load_config()
    config['printer'] = config['printer'] if config['printer'] in list_printers() else ''
    save_config(config)
    return jsonify({"status": "success", "body": status_printer()}), 200  # Возвращаем ответ


def run_flask():
    app.run()


if __name__ == '__main__':
    # Создаем поток для Flask
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()
    # При желании можно ждать завершения потоков