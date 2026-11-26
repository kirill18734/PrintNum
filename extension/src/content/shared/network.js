// Мост между MAIN world (сетевые запросы Ozon) и content script.
(function () {
  const listeners = [];

  function notify(payload) {
    listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error("PrintNum: ошибка обработчика сетевого ответа:", error);
      }
    });
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.data?.source !== "PRINTNUM_NETWORK") return;
    notify(event.data.payload);
  });

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("src/content/shared/network-main.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.network = {
    subscribe(listener) {
      if (typeof listener !== "function") return () => {};
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) listeners.splice(index, 1);
      };
    },
  };
})();
