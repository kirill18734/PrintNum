// Shared HTTP helpers for requests to the local service.
(function () {
  window.PrintNum = window.PrintNum || {};

  window.PrintNum.utils = {
    // Безопасное открытие внешних ссылок и внутренних PDF-страниц расширения
    openLink(url) {
      if (!url) return;
      if (typeof chrome !== "undefined" && chrome.tabs) {
        const fullUrl =
          url.startsWith("/") && !url.startsWith("//")
            ? chrome.runtime.getURL(url)
            : url;
        chrome.tabs.create({ url: fullUrl });
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },

    // Преобразование ключа (например, "qrCodes" -> "offQrCodes")
    getOffStorageKey(key) {
      if (!key) return "";
      return "off" + key.charAt(0).toUpperCase() + key.slice(1);
    },
  };
})();
