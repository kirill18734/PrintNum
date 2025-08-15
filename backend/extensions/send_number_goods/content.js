const previousCodes = new Set();
const local_url_send_to_server = "http://127.0.0.1:4025/print_number";
const find_selector = "._logsWrapper_1igxv_7";
const timeout_sec = 1000;

let observer = null; // MutationObserver
let isMonitoring = false; // идёт ли сейчас мониторинг

function isValidCode(code) {
    return /^\d{1,}-\d+$/.test(code); // Пример: 422-4352
}

function sendToServer(text) {
    fetch(local_url_send_to_server, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    })
    .then(res => res.json())
    .then(data => console.log("📤 Отправлено на сервер:", data))
    .catch(err => console.error("❌ Ошибка:", err));
}

function scanAndCompare() {
    const items = document.querySelectorAll('[data-testid="logItemPlace"]');

    for (const item of items) {
        const code = item.textContent.trim();
        if (!isValidCode(code)) {
            console.warn("⛔ Некорректный формат:", code);
            continue;
        }

        if (!previousCodes.has(code)) {
            previousCodes.add(code);
            console.log("📦 Новый номер:", code);
            sendToServer(code);
        }
    }
}

function startMonitoring(targetNode) {
    if (isMonitoring) return;
    isMonitoring = true;

    observer = new MutationObserver(() => scanAndCompare());
    observer.observe(targetNode, { childList: true, subtree: true });

    console.log(`✅ Найден элемент ${find_selector}. Мониторинг запущен`);
    scanAndCompare();
}

function stopMonitoring() {
    if (!isMonitoring) return;
    isMonitoring = false;

    if (observer) {
        observer.disconnect();
        observer = null;
    }
    console.log(`🛑 Элемент ${find_selector} исчез. Мониторинг остановлен`);
}

function checkSelectorLoop() {
    const targetNode = document.querySelector(find_selector);

    if (targetNode) {
        startMonitoring(targetNode);
    } else {
        stopMonitoring();
    }

    setTimeout(checkSelectorLoop, timeout_sec);
}

checkSelectorLoop();
