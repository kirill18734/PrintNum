// Shares one keyboard listener between scanner input and registered key handlers.
(function () {
  const scannerListeners = [];
  const keyListeners = [];
  let scanBuffer = "";
  let resetTimeout = null;

  function listen(listener, key = null) {
    if (key) {
      keyListeners.push({ listener, key });
    } else {
      scannerListeners.push(listener);
    }
  }

  window.addEventListener(
    "keydown",
    (event) => {
      keyListeners.forEach(({ listener, key }) => {
        if (event.key === key) listener(event);
      });

      if (event.key.length === 1) {
        if (resetTimeout) clearTimeout(resetTimeout);

        scanBuffer += event.key;
        resetTimeout = setTimeout(() => {
          scanBuffer = "";
        }, 500);
        return;
      }

      if (event.key === "Enter") {
        if (resetTimeout) {
          clearTimeout(resetTimeout);
          resetTimeout = null;
        }

        if (scanBuffer) {
          scannerListeners.forEach((listener) => listener(scanBuffer));
        }
        scanBuffer = "";
      }
    },
    true,
  );

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.keyboard = { listen };
})();
