// Shared HTTP helpers for requests to the local service.
(function () {
  const sendServer = {
    get: async (domain = window.PrintNum.config.API_BASE, endpoint = "") =>
      fetch(`${domain}/${endpoint}`),
    post: async (endpoint, body) =>
      fetch(`${window.PrintNum.config.API_BASE}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }),
  };

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.api = { sendServer };
})();
