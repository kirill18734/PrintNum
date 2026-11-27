// Sends shelf addresses and article barcodes from the Ozon movement response.
(function () {
  const TARGET_PATH = "/api2/address-storage/Movement/put/v2";
  const { subscribe } = window.PrintNum.network;

  async function sendPrintData(address, articleId) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "sendNumberToFlask",
        text: address,
        barcode: articleId,
      });

      if (!response || !response.success) {
        console.error(
          `[PrintNum] Не удалось отправить данные для печати "${address}": ${response?.error || "Неизвестная ошибка"}`,
        );
      }
    } catch (error) {
      console.error(
        `[PrintNum] Ошибка отправки данных для печати "${address}":`,
        error,
      );
    }
  }

  function handleNetworkResponse(response) {
    if (
      String(response.method || "").toUpperCase() !== "POST" ||
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

    if (pathname !== TARGET_PATH) return;

    const positions = response.data?.articlePositions;
    if (!Array.isArray(positions)) return;

    positions.forEach((position) => {
      const address = typeof position?.address === "string"
        ? position.address.trim()
        : "";
      const articleId = position?.articleId;

      if (!address || articleId === undefined || articleId === null || articleId === "") {
        return;
      }

      sendPrintData(address, articleId);
    });
  }

  subscribe(handleNetworkResponse);
})();
