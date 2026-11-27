// Отправка ячеек на печать по сетевому ответу Ozon.
(function () {
  const { PATH } = window.PrintNum.config;
  const { subscribe: subscribeNavigation } = window.PrintNum.navigation;
  const { subscribe: subscribeNetwork } = window.PrintNum.network;
  const { runScript: confirmPlacement } = window.PrintNum.confirmPlacement;

  const MOVEMENT_URL = "/api2/address-storage/Movement/put/v2";

  let orderObserver = null;

  async function sendNumber(data) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "sendNumberToFlask",
        number: data,
      });

      if (!response || !response.success) {
        console.error(
          `Ошибка отправки ячейки "${data.text}" через фоновый скрипт: ${response?.error || "Неизвестная ошибка"}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        `Ошибка отправки ячейки "${data.text}" через фоновый скрипт:`,
        error,
      );
      return false;
    }
  }

  function handleMovementResponse(response) {
    if (
      response.method?.toUpperCase() !== "POST" ||
      response.status < 200 ||
      response.status >= 300
    ) {
      return;
    }

    let pathname;
    try {
      pathname = new URL(response.url, location.origin).pathname;
    } catch {
      return;
    }

    if (pathname !== MOVEMENT_URL) return;

    const positions = response.data?.articlePositions;
    if (!Array.isArray(positions)) return;

    positions.forEach((position) => {
      const { articleId, address } = position || {};

      if (
        (typeof articleId !== "string" && typeof articleId !== "number") ||
        !String(articleId).trim() ||
        typeof address !== "string" ||
        !address.trim()
      ) {
        return;
      }

      sendNumber({
        text: address.trim(),
        barcode: String(articleId),
      });
    });
  }

  // Автоподтверждение размещения на странице выдачи заказов сохраняется.
  function stopOrderObserver() {
    if (!orderObserver) return;
    orderObserver.disconnect();
    orderObserver = null;
  }

  function handleNavigation() {
    stopOrderObserver();

    if (!location.pathname.startsWith(PATH.order)) return;

    orderObserver = new MutationObserver(() => confirmPlacement());
    orderObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  subscribeNetwork(handleMovementResponse);
  subscribeNavigation(handleNavigation);
})();
