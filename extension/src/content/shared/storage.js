// Provides cached asynchronous helpers for reading and writing extension local storage.
(function () {
  // Локальный кэш для хранения уже загруженных данных
  const storageCache = {};

  // Инициализация: подписываемся на изменения в chrome.storage
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local") {
      for (let [key, { newValue }] of Object.entries(changes)) {
        if (newValue === undefined) {
          delete storageCache[key]; // Если данные удалены
        } else {
          storageCache[key] = newValue; // Обновляем кэш актуальным значением
        }
      }
    }
  });

  async function getLocal(key) {
    // Если значение уже есть в кэше, возвращаем его (без обращения к API)
    if (Object.prototype.hasOwnProperty.call(storageCache, key)) {
      return storageCache[key];
    }

    // Если в кэше нет, делаем один запрос к хранилищу
    const result = await chrome.storage.local.get(key);

    if (Object.prototype.hasOwnProperty.call(result, key)) {
      storageCache[key] = result[key]; // Сохраняем в кэш
      return result[key];
    }

    return false;
  }

  async function setLocal(name, value) {
    // Сначала обновляем локальный кэш, чтобы последующие вызовы getLocal сразу видели актуальные данные
    storageCache[name] = value;
    // Записываем в постоянное хранилище
    await chrome.storage.local.set({ [name]: value });
  }

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.storage = { getLocal, setLocal };
})();
