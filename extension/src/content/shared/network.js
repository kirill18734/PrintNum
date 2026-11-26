// Provides a subscription API for network responses captured in the page world.
(function () {
  const listeners = new Set();
  const EVENT_NAME = "printnum:network-response";

  window.addEventListener(EVENT_NAME, (event) => {
    listeners.forEach((listener) => {
      try {
        listener(event.detail);
      } catch (error) {
        console.error("[PrintNum] Network subscriber error:", error);
      }
    });
  });

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Network subscriber must be a function");
    }

    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.network = { subscribe };
})();
