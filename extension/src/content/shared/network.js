// Monitors Fetch and XMLHttpRequest responses and notifies subscribers.
(function () {
  const listeners = new Set();
  const originalFetch = window.fetch;
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;
  const xhrMetadata = new WeakMap();

  function notify(response) {
    listeners.forEach((listener) => {
      try {
        listener(response);
      } catch (error) {
        console.error("[PrintNum] Network subscriber error:", error);
      }
    });
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Network subscriber must be a function");
    }

    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function parseJson(body, headers) {
    const contentType = headers["content-type"] || "";
    if (!body || !contentType.includes("json")) return undefined;

    try {
      return JSON.parse(body);
    } catch {
      return undefined;
    }
  }

  function parseXhrHeaders(rawHeaders) {
    const headers = {};
    rawHeaders.trim().split(/[\r\n]+/).forEach((line) => {
      if (!line) return;
      const separator = line.indexOf(":");
      if (separator === -1) return;

      const name = line.slice(0, separator).trim().toLowerCase();
      const value = line.slice(separator + 1).trim();
      headers[name] = headers[name] ? headers[name] + ", " + value : value;
    });
    return headers;
  }

  async function readFetchResponse(response, request) {
    let body;

    try {
      body = await response.clone().text();
    } catch (error) {
      console.error("[PrintNum] Failed to read network response:", error);
    }

    const headers = Object.fromEntries(response.headers.entries());

    notify({
      type: "fetch",
      request,
      url: response.url || request.url,
      method: request.method,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers,
      body,
      json: parseJson(body, headers),
    });
  }

  window.fetch = function (...args) {
    const input = args[0];
    const options = args[1] || {};
    const url =
      typeof input === "string" || input instanceof URL
        ? String(input)
        : input && input.url;
    const method = String(
      options.method || (input && input.method) || "GET",
    ).toUpperCase();
    const request = { url, method };

    return originalFetch.apply(this, args).then((response) => {
      readFetchResponse(response, request);
      return response;
    });
  };

  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    xhrMetadata.set(this, {
      method: String(method || "GET").toUpperCase(),
      url: String(url),
    });
    return originalXhrOpen.call(this, method, url, ...args);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener(
      "loadend",
      () => {
        const request = xhrMetadata.get(this) || {};
        let body;

        try {
          body =
            this.responseType === "" || this.responseType === "text"
              ? this.responseText
              : this.response;
        } catch {
          body = undefined;
        }

        const headers = parseXhrHeaders(this.getAllResponseHeaders());
        const json =
          typeof body === "string"
            ? parseJson(body, headers)
            : this.responseType === "json"
              ? body
              : undefined;

        notify({
          type: "xhr",
          request,
          url: this.responseURL || request.url,
          method: request.method,
          status: this.status,
          statusText: this.statusText,
          ok: this.status >= 200 && this.status < 300,
          headers,
          body,
          json,
        });
      },
      { once: true },
    );

    return originalXhrSend.apply(this, args);
  };

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.network = { subscribe };
})();
