// уникальные номера
const previousCodes = new Set();

// селектор номера
const NUMBER_SELECTOR = "._shelfTag_jn3ur_21";

// адреса
const PRINT_SERVER = "http://127.0.0.1:5000/print_number";
const WORK_URL = "https://turbo-pvz.ozon.ru/receiving-v2/main";
let lasttags = [];
let isFirstRun = true;
async function sendToServer(text) {
  try {
    await fetch(PRINT_SERVER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: text,
    });
  } catch (err) {
    console.error(`❌ Приемка: ошибка отправки номера ${text}: `, err);
  }
}

function checkNumber() {
  const tags = document.querySelectorAll(NUMBER_SELECTOR);

  if (!tags.length) return;

  const text = tags[0].textContent;

  // не отправляем на распечатку при первом запуске
  if (isFirstRun) {
    previousCodes.add(text);
    lasttags = [...tags];
    isFirstRun = false;
    return;
  }
  if (!previousCodes.has(text)) {
    previousCodes.add(text);

    sendToServer(text);
  } else {
    if (lasttags.length !== tags.length) {
      sendToServer(text);
    }
  }
  lasttags = [...tags];
}

// отслеживание изменения URL
new MutationObserver(() => {
  if (location.href == WORK_URL) {
    checkNumber();
  } else {
    if (!isFirstRun) isFirstRun = true;
  }
}).observe(document, {
  childList: true,
  subtree: true,
});
