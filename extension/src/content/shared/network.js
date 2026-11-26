// Shared network monitor.
// The same file is loaded in MAIN and ISOLATED worlds:
// - MAIN observes page requests and emits response data.
// - ISOLATED exposes the subscription API to extension features.
(function () {
  const EVENT_NAME = "printnum:network-response";
  const isExtensionIsolatedWorld =
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime && chrome.runtime.id);

  if (!isExtensionIsolatedWorld) {
    // MAIN world: observe requests made by the Ozon page.
    function notify({ type, method, url, status, data }) {
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: { type, method, url, status, data },
        })
      );
    }

    function parseData(value) {
      if (typeof value !== "string") return value;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const [resource, config] = args;
      const url =
        typeof resource === "string"
          ? resource
          : resource && resource.url
            ? resource.url
            : String(resource || "");
      const method = String(
        (config && config.method) ||
          (resource && resource.method) ||
          "GET"
      ).toUpperCase();

      return originalFetch.apply(this, args).then((response) => {
        // Read a clone so the page can still consume the original response.
        response
          .clone()
          .text()
          .then((text) => {
            notify({
              type: "FETCH",
              method,
              url: response.url || url,
              status: response.status,
              data: parseData(text),
            });
          })
          .catch(() => {
            // Monitoring must not interfere with the original request.
          });

        return response;
      });
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      this._printNumRequest = {
        method: String(method || "GET").toUpperCase(),
        url: String(url),
      };

      return originalOpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener(
        "load",
        function () {
          let responseData;

          try {
            if (this.responseType === "" || this.responseType === "text") {
              responseData = parseData(this.responseText);
            } else {
              responseData = this.response;
            }
          } catch {
            responseData = undefined;
          }

          const request = this._printNumRequest || {};

          notify({
            type: "XHR",
            method: request.method || "GET",
            url: this.responseURL || request.url || "",
            status: this.status,
            data: responseData,
          });
        },
        { once: true }
      );

      return originalSend.apply(this, args);
    };

    return;
  }

  // ISOLATED world: distribute responses to extension subscribers.
  const listeners = new Set();

  window.addEventListener(EVENT_NAME, (event) => {
    const response = event.detail;

    listeners.forEach((listener) => {
      try {
        listener(response);
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
