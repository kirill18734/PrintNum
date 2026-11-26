// Observes Ozon responses in MAIN world and exposes subscribers in ISOLATED world.
// The same file is registered in both worlds in manifest.json.
(function () {
  const MESSAGE_SOURCE = "PRINTNUM_REQUEST_HANDLER";
  const MAIN_READY = "PRINTNUM_REQUEST_HANDLER_MAIN_READY";
  const ISOLATED_READY = "PRINTNUM_REQUEST_HANDLER_ISOLATED_READY";

  function isExtensionWorld() {
    return (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      typeof chrome.runtime.id === "string"
    );
  }

  function parseText(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return text;
    }
  }

  // ISOLATED world: subscribers are available to other extension scripts.
  if (isExtensionWorld()) {
    const listeners = [];

    function subscribe(callback) {
      if (typeof callback !== "function") {
        throw new TypeError("Request listener must be a function");
      }

      listeners.push(callback);

      return function unsubscribe() {
        const index = listeners.indexOf(callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      };
    }

    window.addEventListener("message", (event) => {
      if (
        event.source !== window ||
        event.origin !== window.location.origin ||
        !event.data
      ) {
        return;
      }

      if (event.data.source === MAIN_READY) {
        // Repeat the handshake in case the MAIN-world script started later.
        window.postMessage(
          { source: ISOLATED_READY },
          window.location.origin,
        );
        return;
      }

      if (
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

    // Also announce readiness in case MAIN world has already started.
    window.postMessage(
      { source: ISOLATED_READY },
      window.location.origin,
    );

    window.PrintNum = window.PrintNum || {};
    window.PrintNum.requestHandler = { subscribe };
    return;
  }

  // MAIN world: observe network responses without consuming the page's
  // original response. Data is forwarded asynchronously to ISOLATED world.
  const pendingResponses = [];
  const xhrRequests = new WeakMap();
  let bridgeReady = false;

  function publish(response) {
    if (!bridgeReady) {
      pendingResponses.push(response);
      return;
    }

    try {
      window.postMessage(
        { source: MESSAGE_SOURCE, response },
        window.location.origin,
      );
    } catch (error) {
      // Monitoring must never interfere with Ozon.
    }
  }

  function setBridgeReady() {
    if (bridgeReady) return;
    bridgeReady = true;

    while (pendingResponses.length) {
      publish(pendingResponses.shift());
    }
  }

  window.addEventListener("message", (event) => {
    if (
      event.source === window &&
      event.origin === window.location.origin &&
      event.data &&
      event.data.source === ISOLATED_READY
    ) {
      setBridgeReady();
    }
  });

  // Start the handshake. The isolated script responds if it is already ready.
  window.postMessage(
    { source: MAIN_READY },
    window.location.origin,
  );

  // Fetch: return the original promise immediately; read only a response clone.
  try {
    const originalFetch = window.fetch;

    if (typeof originalFetch === "function") {
      window.fetch = function (...args) {
        const [resource, config] = args;
        const url =
          typeof resource === "string"
            ? resource
            : resource && typeof resource.url === "string"
              ? resource.url
              : "";
        const method = String(
          (config && config.method) ||
          (resource && resource.method) ||
          "GET"
        ).toUpperCase();

        const requestPromise = Reflect.apply(originalFetch, this, args);

        requestPromise
          .then((response) => {
            try {
              response.clone().text().then((text) => {
                publish({
                  type: "FETCH",
                  method,
                  url,
                  status: response.status,
                  data: parseText(text),
                });
              }).catch(() => {});
            } catch (error) {
              // Skip responses that cannot be cloned or read.
            }
          })
          .catch(() => {});

        return requestPromise;
      };
    }
  } catch (error) {
    // XHR monitoring remains active if Fetch cannot be patched.
  }

  // XMLHttpRequest: observe load without changing the response.
  try {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      xhrRequests.set(this, {
        method: String(method || "GET").toUpperCase(),
        url: String(url || ""),
      });

      return Reflect.apply(originalOpen, this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener("load", function () {
        const request = xhrRequests.get(this) || {
          method: "GET",
          url: "",
        };

        let data = this.response;
        if (this.responseType === "" || this.responseType === "text") {
          data = parseText(this.responseText);
        }

        publish({
          type: "XHR",
          method: request.method,
          url: request.url,
          status: this.status,
          data,
        });
      }, { once: true });

      return Reflect.apply(originalSend, this, args);
    };
  } catch (error) {
    // Do not let monitoring failures affect Ozon's normal requests.
  }
})();
