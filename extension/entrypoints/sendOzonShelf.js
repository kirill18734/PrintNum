// Отправляет на печать новые ячейки из колонки «Новая ячейка» на странице Ozon Полки.
// Значения, уже отображавшиеся при запуске, не отправляются.
// отправка ячейки на печать
(async function () {
  let observerPrint = null;
  let oldElements = new Set();
  let isInitialized = false;

  async function sendNumber(number) {
    try {
      // Отправляем сообщение в Background Script и ждем промис
      const response = await chrome.runtime.sendMessage({
        action: "sendNumberToFlask",
        number: number,
      });

      // Если фоновый скрипт вернул ошибку или статус неуспеха
      if (!response || !response.success) {
        console.error(
          `Ошибка сервера (через BG): ${response?.error || "Неизвестная ошибка"}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        `Ошибка отправки номера ячейки "${number}" через фоновый скрипт: `,
        error,
      );
      return false;
    }
  }

  function runScript() {
    const headers = Array.from(document.querySelectorAll("thead th"));
    const columnIndex = headers.findIndex(
      (header) => header.textContent?.trim() === "Новая ячейка",
    );

    if (columnIndex === -1) return;

    const rows = document.querySelectorAll("tbody tr");
    const currentElements = [];

    rows.forEach((row) => {
      const targetCell = row.querySelectorAll("td")[columnIndex];
      if (targetCell) {
        currentElements.push(targetCell.textContent?.trim() || "");
      }
    });

    if (!isInitialized) {
      oldElements = new Set(currentElements);
      isInitialized = true;
      return;
    }

    currentElements.forEach((item) => {
      if (item && !oldElements.has(item)) {
        oldElements.add(item);
        sendNumber(item);
      }
    });
  }

  function resetState() {
    if (observerPrint) {
      observerPrint.disconnect();
      observerPrint = null;
    }

    oldElements = new Set();
    isInitialized = false;
  }

  function toggleState() {
    // Исправлено: Гарантированный сброс состояния при любом переходе
    resetState();

    if (location.pathname !== PATH.shelf) {
      return;
    }

    observerPrint = new MutationObserver(runScript);

    observerPrint.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    runScript();
  }

  subscribe(toggleState);
})();
