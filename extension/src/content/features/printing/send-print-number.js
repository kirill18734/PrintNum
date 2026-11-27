// Sends shelf addresses and article barcodes from the Ozon movement response.
(function () {
  const TARGET_PATH = "/api2/address-storage/Movement/put/v2";
  const { subscribe } = window.PrintNum.network;

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

  function handleNetworkResponse(response) {
    if (String(response.method || "").toUpperCase() !== "POST") {
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

      const printData = {
        text: address,
        barcode: articleId,
      };

      sendPrintData(printData);
    });
  }

  subscribe(handleNetworkResponse);
})();
