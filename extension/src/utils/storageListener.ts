declare const chrome: any;

const storageListeners: any = [];

// Инициализируем один единый слушатель для chrome.storage
chrome.storage.onChanged.addListener((changes: any, areaName: any) => {
  // Фильтруем только локальные изменения
  if (areaName === "local") {
    // Передаем объект изменений в каждую подписанную функцию
    storageListeners.forEach((fn: any) => fn(changes));
  }
});

// Функция для подписки других модулей
export function subscribeStorage(fn: any) {
  storageListeners.push(fn);
}
