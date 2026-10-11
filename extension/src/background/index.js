// Forwards print requests from content scripts to the local Flask service.
const API_BASE = "http://127.0.0.1:5000/print-number";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendNumberToFlask") {
    // Выполняем реальный сетевой запрос
    fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: message.number }),
    })
      .then((response) => {
        if (!response.ok) {
          // Передаем статус ошибки обратно в content script
          sendResponse({
            success: false,
            error: `${response.status} ${response.statusText}`,
          });
        } else {
          sendResponse({ success: true });
        }
      })
      .catch((error) => {
        // Передаем сетевую ошибку (например, сервер выключен) обратно
        sendResponse({ success: false, error: error.message });
      });

    return true; // КРИТИЧЕСКИ ВАЖНО для асинхронного ответа через sendResponse
  }
});
