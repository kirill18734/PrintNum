// отправка ячеек на локальный сервер
(async function () {
  const { PATH } = window.PrintNum.config;
  const { subscribe } = window.PrintNum.network;

  const RESPONSE_HANDLERS = {
    [PATH.moveArticleApi]: handleMovementResponse, // Раздел "Остатки на Ozon Полке"
    [PATH.microFFStockApi]: handleInboundResponse, // раздел "Перемещение товаров"
  };

  async function sendPrintData(printData) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "sendShelfToFlask",
        data: printData,
      });

      if (!response || !response.success) {
        console.error(
          `[PrintNum] Не удалось отправить данные для печати "${printData.text}": ${response?.error || "Неизвестная ошибка"}`,
        );
      }
    } catch (error) {
      console.error(
        `[PrintNum] Ошибка отправки данных для печати "${printData.text}":`,
        error,
      );
    }
  }

  // Раздел "Остатки на Ozon Полке"
  function handleInboundResponse(data) {
    const positions = data?.positions;
    if (!Array.isArray(positions)) return;

    positions.forEach((position) => {
      const { entity, shelf } = position ?? {};
      if (!entity?.id || !shelf?.address) return;

      sendPrintData({
        text: entity.id,
        barcode: shelf.address,
      });
    });
  }

  // раздел "Перемещение товаров"
  function handleMovementResponse(data) {}

  function handleNetworkResponse({ method, url, data }) {
    if (method !== "POST") return;

    try {
      const { pathname } = new URL(url, location.origin);

      RESPONSE_HANDLERS[pathname]?.(data);
    } catch {}
  }

  subscribe(handleNetworkResponse);
})();
