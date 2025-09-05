const previousCodes = new Set();
const find_selector = "._shelfTag_1tkm1_2";
const local_url_send_to_server = "http://127.0.0.1:5000/print_number";
const work_url = "https://turbo-pvz.ozon.ru/receiving-v2/main";
const timeout_find_number = 300;
const timeout_find_url = 500;
let prevUrl = undefined;
let timerId;
let first_run = false;

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

function start() {
  const number = document.querySelector(find_selector);
  if (!number) {
    console.error(
      `❌ Элемент с селектором '${find_selector}' не найден. Повторная попытка через ${timeout_find_number} мс.`
    );
    return;
  }

  let code = number.textContent;
  // отправка на сервер
  if (!previousCodes.has(code)) {
    previousCodes.add(code);
    sendToServer(code);
  }
}

setInterval(() => {
  const currUrl = window.location.href;
  if (currUrl != prevUrl) {
    if (currUrl == work_url) {
      if (!first_run) {
        console.log("Скрипт на поиск ячеек Активирован");
        first_run = true;
      }
      // запускаем цикл поиска ячеек
      timerId = setInterval(start, timeout_find_number);
    } else {
      if (first_run) {
        console.log("Скрипт на поиск ячеек Деактивирован");
        first_run = false;
      }
      // останавливаем цикл поиска
      if (timerId) {
        clearInterval(timerId);
      }
    }
    prevUrl = currUrl;
  }
}, timeout_find_url);
