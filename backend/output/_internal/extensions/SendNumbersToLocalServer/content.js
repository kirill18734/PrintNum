const previousCodes = new Set();
const local_url_send_to_server = "http://127.0.0.1:5000/print_number";
const find_selector = "._logsWrapper_1igxv_7";
const timeout_sec = 1000; // 1 секунда между проверками

function isValidCode(code) {
    return /^\d{1,}-\d+$/.test(code); // Пример: 422-4352
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
    .then(data => console.log("📤 Отправлено на сервер:", data))
    .catch(err => console.error("❌ Ошибка:", err));
}

function scanAndCompare() {
    const items = document.querySelectorAll('[data-testid="logItemPlace"]');
    items.forEach(item => {
        const code = item.textContent.trim();
        if (isValidCode(code) && !previousCodes.has(code)) {
            previousCodes.add(code);
            console.log("📦 Новый номер:", code);
            sendToServer(code);
        }
    });
}

function start() {
    const targetNode = document.querySelector(find_selector);
    if (!targetNode) {
        console.warn(`❌ Не удалось найти элемент ${find_selector}. Попробую снова...`);
        setTimeout(start, timeout_sec);
    } else {
        console.log(`✅ Элемент ${find_selector} найден. Скрипт на мониторинг номеров запущен.`);
        scanAndCompare(); // сразу сканируем текущие элементы
        setInterval(scanAndCompare, timeout_sec); // бесконечный цикл проверки
    }
}

start();
