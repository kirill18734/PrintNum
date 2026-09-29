const storageListeners = [];

// Инициализируем один единый слушатель для chrome.storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  // Фильтруем только локальные изменения
  if (areaName === "local") {
    // Передаем объект изменений в каждую подписанную функцию
    storageListeners.forEach((fn) => fn(changes));
  }
});

// Функция для подписки других модулей
function subscribeStorage(fn) {
  storageListeners.push(fn);
}
