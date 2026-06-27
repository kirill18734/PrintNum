import os
import json
from flask_cors import CORS
from flask import Flask, jsonify, send_from_directory, abort

app = Flask(__name__)
CORS(app)  # Включаем CORS для всего приложения

# Отключаем экранирование кириллицы в JSON
app.config['JSON_AS_ASCII'] = False  # Для старых версий Flask
app.json.ensure_ascii = False        # Для новых версий Flask 2.2+

# Базовый путь к вашей папке с данными на Linux
DATA_DIR = '/data'

# 1. Корневой маршрут
@app.route('/', methods=['GET'])
def index():
    return "Hello World", 200

# 2. Универсальный маршрут для вложенных путей и файлов
# Использование <path:filepath> позволяет принимать строки со слэшами, например "v1.0.1/printnum.exe"
@app.route('/<path:filepath>', methods=['GET'])
def get_file_or_json(filepath):
    
    # Нормализуем путь (убираем лишние слэши, если они есть в начале или конце)
    filepath = filepath.strip('/')
    
    # Обработка конкретно файла latest.json в корне
    if filepath == 'latest.json':
        json_path = os.path.join(DATA_DIR, 'latest.json')
        if not os.path.exists(json_path):
            return jsonify({"error": "File not found"}), 404
            
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                return jsonify(data)
            except json.JSONDecodeError:
                return jsonify({"error": "Invalid JSON format"}), 500

    # Обработка вложенных папок и файлов (например, v1.0.1/printnum.exe)
    # Функция send_from_directory сама безопасно склеит DATA_DIR и внутренний путь filepath
    try:
        return send_from_directory(DATA_DIR, filepath, as_attachment=True)
    except FileNotFoundError:
        abort(404, description="Resource not found")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
