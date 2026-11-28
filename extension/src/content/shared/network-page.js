// Intercepts page network responses in the MAIN world and forwards them
// to the isolated content-script world without changing the original requests.
(function () {
  const INSTALL_FLAG = "__PRINTNUM_NETWORK_INTERCEPTOR__";
  const MESSAGE_TYPE = "PRINTNUM_NETWORK_RESPONSE";

  if (window[INSTALL_FLAG]) return;
  window[INSTALL_FLAG] = true;

  function parseText(text) {
    if (typeof text !== "string") return text;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function publish(payload) {
    try {
      window.postMessage(
        {
          source: "PRINTNUM_NETWORK",
          type: MESSAGE_TYPE,
          payload,
        },
        location.origin,
      );
    } catch (error) {
      // A response that cannot be structured-cloned must not affect the page.
      console.debug("[PrintNum] Не удалось передать сетевой ответ", error);
    }
  }

  // fetch
  const originalFetch = window.fetch;
  if (typeof originalFetch === "function") {
    window.fetch = function (...args) {
      const request = args[0];
      const options = args[1] || {};
      const method = String(
        options.method || (request && request.method) || "GET",
      ).toUpperCase();
      const url = request && request.url ? request.url : String(request);

      return Reflect.apply(originalFetch, this, args).then((response) => {
        // Forward only successful HTTP responses (2xx).
        if (!response.ok) return response;

        try {
          const responseCopy = response.clone();

          responseCopy
            .text()
            .then((text) => {
              publish({
                type: "FETCH",
                method,
                url: response.url || url,
                status: response.status,
                data: parseText(text),
              });
            })
            .catch(() => {});
        } catch {
          // Reading a response copy is best-effort only.
        }

        return response;
      });
    };
  }

  // XMLHttpRequest
  const xhrInfo = new WeakMap();
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    xhrInfo.set(this, {
      method: String(method || "GET").toUpperCase(),
      url: String(url),
    });

    return Reflect.apply(originalOpen, this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    if (!this.__printNumResponseListenerAttached) {
      this.__printNumResponseListenerAttached = true;

      this.addEventListener("loadend", () => {
        const requestInfo = xhrInfo.get(this);
        if (!requestInfo) return;

        // Ignore redirects, HTTP errors, and network failures.
        if (this.status < 200 || this.status >= 300) return;

        let data;
        try {
          switch (this.responseType) {
            case "json":
              data = this.response;
              break;
            case "blob":
            case "arraybuffer":
              data = this.response;
              break;
            case "document":
              data =
                this.response && this.response.documentElement
                  ? this.response.documentElement.outerHTML
                  : null;
              break;
            case "":
            case "text":
            default:
              data = parseText(this.responseText);
              break;
          }
        } catch {
          data = null;
        }

        publish({
          type: "XHR",
          method: requestInfo.method,
          url: this.responseURL || requestInfo.url,
          status: this.status,
          data,
        });
      });
    }

    return Reflect.apply(originalSend, this, args);
  };
})();
