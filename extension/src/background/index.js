// Forwards print requests from content scripts to the local Flask service.
const API_BASE = "http://127.0.0.1:5000";
// Укажите часть URL или домен страниц, которые нужно перезапустить при установке
const TARGET_DOMAIN = "turbo-pvz.ozon.ru";

function sendRequest(endpoint, dict) {
  // Безопасно соединяет хост и эндпоинт, убирая лишние слэши
  const url = new URL(endpoint, API_BASE).toString();

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dict),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return { success: true };
  });
}

// Перезапуск целевых страниц при первой установке расширения
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        // Проверяем наличие URL и совпадение с целевым доменом
        if (tab.url && tab.url.includes(TARGET_DOMAIN) && tab.id) {
          chrome.tabs.reload(tab.id);
        }
      });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendNumberToFlask") {
    sendRequest("print-number", { text: message.number })
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    return true;
  }
  if (message.action === "sendShelfToFlask") {
    sendRequest("ozon-shelf", { text: message.number })
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    return true;
  }
});
