const previousCodes = new Set();
const local_url_send_to_server = "http://127.0.0.1:5000/print_number";
const find_selector = "._logsWrapper_1igxv_7";
const timeout_sec = 300; // 1 секунда между проверками

function isValidCode(code) {
    const valid = /^\d{1,}-\d+$/.test(code); // Пример: 422-4352
    if (!valid) {
        console.error(`❌ Невалидный код: '${code}'`); // Лог ошибки, если код невалидный
    }
    return valid;
}

function sendToServer(text) {
    fetch(local_url_send_to_server, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    })
    .then(res => res.json())
    .then(response => {
        // можно добавить логи для успешного ответа, если нужно
    })
    .catch(err => {
        console.error("❌ Ошибка при отправке на сервер:", err); // Лог ошибки при отправке данных
    });
}

function scanAndCompare() {
    try {
        const items = document.querySelectorAll('[data-testid="logItemPlace"]');
        if (items.length === 0) {
            console.warn("⚠️ Нет элементов для сканирования."); // Лог предупреждения, если нет элементов
        }
        items.forEach(item => {
            const code = item.textContent.trim();
            if (isValidCode(code) && !previousCodes.has(code)) {
                previousCodes.add(code);
                sendToServer(code);
            }
        });
    } catch (err) {
        console.error("❌ Ошибка в процессе сканирования:", err); // Лог ошибки в процессе сканирования
    }
}

function start() {
    try {
        const targetNode = document.querySelector(find_selector);
        if (!targetNode) {
            console.error(`❌ Элемент с селектором '${find_selector}' не найден. Повторная попытка через ${timeout_sec} мс.`); // Лог ошибки, если элемент не найден
            setTimeout(start, timeout_sec);
        } else {
            scanAndCompare(); // сразу сканируем текущие элементы
            setInterval(scanAndCompare, timeout_sec); // бесконечный цикл проверки
        }
    } catch (err) {
        console.error("❌ Ошибка при запуске процесса:", err); // Лог ошибки при запуске процесса
    }
}

start();
