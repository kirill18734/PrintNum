from flask import Flask, request, jsonify
from flask_cors import CORS
from data import load_config, save_config
from print_text import print_text
from utils import status_printer, list_printers, format_number

app = Flask(__name__)
CORS(app)  # Включаем CORS для всего приложения

@app.route('/firstRun', methods=['POST'])
def start():
    config = load_config().copy()

    config['printer']['data'] = list_printers()

    return jsonify({"config": config}), 200


# статус принтера
@app.route('/statePrinter', methods=['POST'])
def state_printer():
    return jsonify({"state": status_printer()}), 200  # Возвращаем ответ


@app.route('/set_config', methods=['POST'])
def set_config():
    config = load_config().copy()
    body = request.get_json()
    new_config = {**config, **body}

    if config != new_config:
        save_config(new_config)
    return jsonify({"update_config": "OK"}), 200


# печать
@app.route('/print_number', methods=['POST'])
def print_number():
    try:
        config = load_config()
        mode = config['mode']['default']
        width = config['paper']['width']
        height = config['paper']['height']
        search = config['search']

        if config['running']["default"] and mode == 'extension' and width and height:
            new_number = request.data.decode("utf-8").strip()
            new_number = format_number(new_number, search)

            print(f"📥 Пришли данные: '{new_number}'")
            if not new_number:
                return jsonify({'status': 'error', 'message': f'Получено некорректное значение: "{new_number}"'}), 400
            print_text(new_number, config)
            return jsonify({'status': 'success', 'message': f'Распечатано: "{new_number}"'})
        else:
            # Возвращаем ответ, если условие не выполнено
            return jsonify({'status': 'error', 'message': 'Сервис не запущен или не выбран режим расширения'}), 400

    except Exception as e:
        print("❌ Ошибка во Flask-приложении:", e)
        return jsonify({'status': 'error', 'message': f'Ошибка во Flask-приложении: {str(e)}'}), 500



if __name__ == '__main__':
    app.run()
