// Shares a single chrome.storage listener with registered local-storage handlers.
(function () {
  const storageListeners = [];

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local") {
      storageListeners.forEach((listener) => listener(changes));
    }
  });

  function subscribe(listener) {
    storageListeners.push(listener);
  }

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.storageEvents = { subscribe };
})();
