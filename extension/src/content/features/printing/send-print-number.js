// Отправка ячеек на печать по сетевому ответу Ozon.
(function () {
  const { PATH } = window.PrintNum.config;
  const { subscribe: subscribeNavigation } = window.PrintNum.navigation;
  const { subscribe: subscribeNetwork } = window.PrintNum.network;
  const { runScript: confirmPlacement } = window.PrintNum.confirmPlacement;

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
    response.data.articlePositions.forEach(({ articleId, address }) => {
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
