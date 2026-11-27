// отправка ячеек на локальный сервер
(async function () {
  const { subscribe } = window.PrintNum.network;
  const { PATH } = window.PrintNum.config;

  const RESPONSE_HANDLERS = {
    [PATH.receivingPutApi]: handleMovementResponse, // раздел "Приемка"
    [PATH.outboundArticleApi]: handleInboundResponse, // раздел "Выдача"
  };

  async function sendPrintData(printData) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "sendNumberToFlask",
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

  function handleMovementResponse(data) {
    const positions = data?.articlePositions;
    if (!Array.isArray(positions)) return;

    positions.forEach((position) => {
      const { address, articleId } = position ?? {};
      if (!address) return;

      sendPrintData({
        text: address,
        barcode: articleId,
      });
    });
  }

  function handleInboundResponse(data) {
    const address = data?.addressStoragePosition?.address;
    const articleId = data?.articleId;

    if (!address) return;

    sendPrintData({
      text: address,
      barcode: articleId,
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
