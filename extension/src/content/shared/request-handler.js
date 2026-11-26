// Provides a subscriber API in the extension's isolated content-script world.
(function () {
  const MESSAGE_SOURCE = "PRINTNUM_REQUEST_INTERCEPTOR";
  const listeners = [];

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Request listener must be a function");
    }

    listeners.push(listener);

    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }

  window.addEventListener("message", (event) => {
    if (
      event.source !== window ||
      event.origin !== window.location.origin ||
      !event.data ||
      event.data.source !== MESSAGE_SOURCE ||
      !event.data.response
    ) {
      return;
    }

    for (const listener of [...listeners]) {
      try {
        listener(event.data.response);
      } catch (error) {
        console.error("[PrintNum] Ошибка обработчика ответа Ozon:", error);
      }
    }
  });

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.requestHandler = { subscribe };
})();
