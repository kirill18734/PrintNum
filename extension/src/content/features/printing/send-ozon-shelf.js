// отправка ячеек на локальный сервер
(async function () {
  const { PATH } = window.PrintNum.config;
  const { subscribe } = window.PrintNum.network;

  const RESPONSE_HANDLERS = {
    [PATH.prepShipmentApi]: printShipmentLabels, // раздел "Подготовка к отправке"
    [PATH.moveArticleApi]: printTransferLabels, // раздел "Перемещение товаров"
    [PATH.microFFStockApi]: printShelfStockLabels, // Раздел "Остатки на Ozon Полке"
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

  // раздел "Подготовка к отправке"
  function printShipmentLabels(data) {}

  // раздел "Перемещение товаров"
  function printTransferLabels(data) {}

  // Раздел "Остатки на Ozon Полке"
  function printShelfStockLabels(data) {
    const positions = data?.positions;
    if (!Array.isArray(positions)) return;

    positions.forEach((position) => {
      const { entity, shelf } = position ?? {};
      if (!shelf?.address) return;

      const printData = { text: shelf.address };
      if (entity?.id !== undefined && entity?.id !== null && entity.id !== "") {
        printData.barcode = entity.id;
      }

      sendPrintData(printData);
    });
  }

  function handleNetworkResponse({ method, url, data }) {
    if (method !== "POST") return;

    try {
      const { pathname } = new URL(url, location.origin);

      RESPONSE_HANDLERS[pathname]?.(data);
    } catch {}
  }

  subscribe(handleNetworkResponse);
})();
