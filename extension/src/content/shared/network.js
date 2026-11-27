// Public API for subscribing to network responses captured in the page world.
(function () {
  const MESSAGE_TYPE = "PRINTNUM_NETWORK_RESPONSE";
  const listeners = new Set();

  function handleMessage(event) {
    if (
      event.source !== window ||
      event.origin !== location.origin ||
      !event.data ||
      event.data.source !== "PRINTNUM_NETWORK" ||
      event.data.type !== MESSAGE_TYPE
    ) {
      return;
    }

    const response = event.data.payload;
    if (!response || typeof response !== "object") return;

    listeners.forEach((listener) => {
      try {
        listener(response);
      } catch (error) {
        console.error("[PrintNum] Ошибка обработчика сетевого ответа:", error);
      }
    });
  }

  window.addEventListener("message", handleMessage);

  function subscribe(callback) {
    if (typeof callback !== "function") {
      throw new TypeError("network.subscribe ожидает функцию");
    }

    listeners.add(callback);
    return () => unsubscribe(callback);
  }

  function unsubscribe(callback) {
    listeners.delete(callback);
  }

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.network = { subscribe, unsubscribe };
})();
