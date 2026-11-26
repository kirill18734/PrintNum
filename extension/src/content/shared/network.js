// Перехват сетевых ответов Ozon в MAIN world страницы.
(function () {
  if (window.__printNumNetworkInstalled) return;
  window.__printNumNetworkInstalled = true;

  function notify({ type, method, url, status, data }) {
    window.postMessage({
      source: "PRINTNUM_NETWORK",
      payload: { type, method, url, status, data },
    }, "*");
  }

  function parseResponse(value) {
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const request = args[0];
    const options = args[1] || {};
    const method = (options.method || request?.method || "GET").toUpperCase();
    const url = typeof request === "string" || request instanceof URL
      ? String(request)
      : request?.url || "";

    return originalFetch.apply(this, args).then((response) => {
      response.clone().text().then((text) => {
        notify({ type: "FETCH", method, url, status: response.status, data: parseResponse(text) });
      }).catch(() => {});
      return response;
    });
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  const requestInfo = new WeakMap();

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    requestInfo.set(this, { method: String(method || "GET").toUpperCase(), url: String(url || "") });
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener("load", function () {
      const request = requestInfo.get(this) || {};
      let data = null;
      try {
        data = this.responseType === "json" ? this.response : parseResponse(this.responseText);
      } catch {
        data = null;
      }
      notify({
        type: "XHR",
        method: request.method || "GET",
        url: request.url || "",
        status: this.status,
        data,
      });
    }, { once: true });
    return originalSend.apply(this, args);
  };
})();