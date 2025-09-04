const previousCodes = new Set();
const local_url_send_to_server = "http://127.0.0.1:5000/print_number";
const find_selector = "._list_1bq3x_12"; // контейнер со всеми логами
const timeout_sec = 300; // 300 мс между проверками

function isValidCode(code) {
  const valid = /^\d{1,}-\d+$/.test(code); // Пример: 422-4352
  if (!valid) {
    console.error(`❌ Невалидный код: '${code}'`);
  }
  return valid;
}

function sendToServer(text) {
  fetch(local_url_send_to_server, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error("❌ Ошибка при отправке на сервер:", err);
    });
}

function scanAndCompare() {
  try {
    const items = document.querySelectorAll("._shelfTag_1tkm1_2");
    if (items.length === 0) {
      console.warn("⚠️ Нет элементов для сканирования.");
    }
    items.forEach((item) => {
      const code = item.textContent.trim();
      if (isValidCode(code) && !previousCodes.has(code)) {
        previousCodes.add(code);
        sendToServer(code);
      }
    });
  } catch (err) {
    console.error("❌ Ошибка в процессе сканирования:", err);
  }
}

function start() {
  try {
    const targetNode = document.querySelector(find_selector);
    if (!targetNode) {
      console.error(
        `❌ Элемент с селектором '${find_selector}' не найден. Повторная попытка через ${timeout_sec} мс.`
      );
      setTimeout(start, timeout_sec);
    } else {
      scanAndCompare();
      setInterval(scanAndCompare, timeout_sec);
    }
  } catch (err) {
    console.error("❌ Ошибка при запуске процесса:", err);
  }
}

start();
