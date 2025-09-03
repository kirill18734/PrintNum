import threading

from flask import Flask, request, jsonify
from flask_cors import CORS  # Импортируем CORS
from data import load_config, save_config, list_printers
from print_text import print_text, status_printer
from screen_find_text_neiro import select_area, show_area, main_neiro

app = Flask(__name__)
CORS(app)  # Включаем CORS для всего приложения

stop_event = threading.Event()
other_thread2 = None


def run_neiro():
    global other_thread2
    config = load_config()
    if config["is_running"] and config["mode"] == "neiro":
        if not other_thread2 or not other_thread2.is_alive():
            stop_event.clear()
            other_thread2 = threading.Thread(
                target=main_neiro,
                args=(config["is_running"], stop_event)
            )
            other_thread2.start()
    else:
        if other_thread2 and other_thread2.is_alive():
            stop_event.set()
# статус принтера
@app.route('/check_state_printer', methods=['POST'])
def state_printer():
    return jsonify({"status": "success", "body": status_printer()}), 200  # Возвращаем ответ


# список принтеров
@app.route('/get_list_printers', methods=['POST'])
def receive_data_get_list_printers():
    data = {
        "printers": [""]+list_printers(),
    }
    return jsonify({"status": "success", "body": data}), 200  # Возвращаем ответ


# показать область отслеживания
@app.route('/show_area', methods=['POST'])
def showarea():
    show_area()
    return 'OK'


# изменить область отслеживания
@app.route('/set_area', methods=['POST'])
def set_area():
    select_area()
    return 'OK'


# запуск нейронки
@app.route('/run_neiro', methods=['POST'])
def receive_data_mode():
    run_neiro()
    return "OK"


# печать
@app.route('/print_number', methods=['POST'])
def print_from_data():
    try:
        config = load_config()
        new_number = request.data.decode("utf-8").strip()
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


def run_flask():
    run_neiro()
    app.run()


if __name__ == '__main__':
    # Создаем поток для Flask
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()
    # При желании можно ждать завершения потоков
    flask_thread.join()