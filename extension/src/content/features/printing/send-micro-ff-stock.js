// Sends changed cell values from the micro-FF stock report to the printer.
(function () {
  const { PATH } = window.PrintNum.config;
  const { subscribe } = window.PrintNum.navigation;

  let observer = null;
  let previousValues = null;
  let scanTimeout = null;

  async function sendShelfToFlask(value) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "sendShelfToFlask",
        number: value,
      });

      if (!response || !response.success) {
        console.error(
          `Не удалось отправить ячейку "${value}" на печать: ${response?.error || "Неизвестная ошибка"}`,
        );
      }
    } catch (error) {
      console.error(`Ошибка отправки ячейки "${value}" на печать:`, error);
    }
  }

  function getCellValues() {
    const tables = document.querySelectorAll("table");

    for (const table of tables) {
      const headers = Array.from(table.querySelectorAll("thead th"));
      const cellIndex = headers.findIndex(
        (header) => header.textContent?.trim() === "Ячейка",
      );

      if (cellIndex === -1) continue;

      const rows = Array.from(table.querySelectorAll("tbody tr"));
      return rows.map(
        (row) => row.cells[cellIndex]?.textContent?.trim() || "",
      );
    }

    return null;
  }

  function scanTable() {
    if (location.pathname !== PATH.microFFStock) return;

    const currentValues = getCellValues();
    if (!currentValues) return;

    // Первое обнаружение таблицы задаёт исходное состояние без печати.
    if (previousValues === null) {
      previousValues = currentValues;
      return;
    }

    const changedValues = [];

    currentValues.forEach((value, index) => {
      if (value && value !== previousValues[index]) {
        changedValues.push(value);
      }
    });

    // Обновляем состояние сразу после попытки обнаружения изменений:
    // успешность отправки не влияет на повторную обработку этого изменения.
    previousValues = currentValues;

    changedValues.forEach(sendShelfToFlask);
  }

  function scheduleScan() {
    if (scanTimeout !== null) {
      clearTimeout(scanTimeout);
    }

    // Даём таблице завершить перерисовку, чтобы не читать промежуточное состояние.
    scanTimeout = setTimeout(() => {
      scanTimeout = null;
      scanTable();
    }, 100);
  }

  function resetState() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    if (scanTimeout !== null) {
      clearTimeout(scanTimeout);
      scanTimeout = null;
    }

    previousValues = null;
  }

  function toggleState() {
    resetState();

    if (location.pathname !== PATH.microFFStock) return;

    observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Проверяем сразу, а если таблица появится позже — сработает observer.
    scanTable();
  }

  subscribe(toggleState);
  toggleState();
})();
