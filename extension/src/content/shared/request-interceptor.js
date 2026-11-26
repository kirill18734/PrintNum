// Runs in the page's MAIN world so it can observe Ozon's own network APIs.
(function () {
  const MESSAGE_SOURCE = "PRINTNUM_REQUEST_INTERCEPTOR";
  const xhrRequests = new WeakMap();
  const pendingResponses = [];
  let bridgeReady = false;

  function publish(response) {
    if (!bridgeReady) {
      pendingResponses.push(response);
      return;
    }

    try {
      window.postMessage(
        {
          source: MESSAGE_SOURCE,
          response,
        },
        window.location.origin,
      );
    } catch (error) {
      // Monitoring must never interfere with the page.
    }
  }

  window.addEventListener("message", (event) => {
    if (
      event.source === window &&
      event.origin === window.location.origin &&
      event.data &&
      event.data.source === MESSAGE_SOURCE &&
      event.data.ready === true
    ) {
      bridgeReady = true;
      while (pendingResponses.length) {
        publish(pendingResponses.shift());
      }
    }
  });

  function parseText(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return text;
    }
  }

  // Fetch interception. Keep the original promise and response untouched.
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
        const method = (
          (config && config.method) ||
          (resource && resource.method) ||
          "GET"
        ).toUpperCase();

        const requestPromise = Reflect.apply(originalFetch, this, args);

        requestPromise
          .then((response) => {
            try {
              response
                .clone()
                .text()
                .then((text) => {
                  publish({
                    type: "FETCH",
                    method,
                    url,
                    status: response.status,
                    data: parseText(text),
                  });
                })
                .catch(() => {});
            } catch (error) {
              // A response that cannot be cloned is simply skipped.
            }
          })
          .catch(() => {});

        return requestPromise;
      };
    }
  } catch (error) {
    // XHR interception below remains available if Fetch cannot be patched.
  }

  // XMLHttpRequest interception. It also covers endpoints that Ozon
  // continues to call through XHR while Fetch interception is available.
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
      this.addEventListener(
        "load",
        function () {
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
        },
        { once: true },
      );

      return Reflect.apply(originalSend, this, args);
    };
  } catch (error) {
    // Do not let monitoring failures affect Ozon's normal requests.
  }
})();
