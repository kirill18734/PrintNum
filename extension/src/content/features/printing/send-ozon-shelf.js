// отправка Ozon Полка на печать при подсветке строки
(async function () {
  const { PATH } = window.PrintNum.config;
  const { subscribe } = window.PrintNum.navigation;

  let observerPrint = null;
  let lastProcessedId = null; // Храним ID последней обработанной строки, чтобы не отправлять дубли

  async function sendNumber(shelf) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "sendShelfToFlask",
        number: shelf,
      });
      if (!response || !response.success) {
        console.error(
          `Ошибка сервера (через BG): ${response?.error || "Неизвестная ошибка"}`,
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error(
        `Ошибка отправки номера ячейки "${shelf}" через фоновый скрипт: `,
        error,
      );
      return false;
    }
  }

  function runScript() {
    const headers = Array.from(document.querySelectorAll("thead th"));

    // Находим индексы нужных колонок
    const newCellIndex = headers.findIndex(
      (h) => h.textContent?.trim() === "Новая ячейка",
    );
    const currentCellIndex = headers.findIndex(
      (h) => h.textContent?.trim() === "Текущая ячейка",
    );

    // Если колонки не найдены, выходим
    if (newCellIndex === -1 || currentCellIndex === -1) return;

    // Быстрый поиск подсвеченной строки (ищет класс в любом месте списка классов строки)
    const highlightedRow = document.querySelector(
      'tbody tr[class*="_highlightedRow_"]',
    );

    // Если подсвеченной строки сейчас нет на экране, сбрасываем ID и выходим
    if (!highlightedRow) {
      lastProcessedId = null;
      return;
    }

    const cells = highlightedRow.querySelectorAll("td");
    const targetCellNew = cells[newCellIndex];
    const targetCellCurrent = cells[currentCellIndex];

    if (targetCellNew && targetCellCurrent) {
      const currentId = targetCellCurrent.textContent?.trim() || "";
      const rawNewValue = targetCellNew.textContent?.trim() || "";

      // Проверяем, изменился ли ID по сравнению с прошлым сканированием и что колонка не пустая
      if (currentId && currentId !== lastProcessedId && rawNewValue) {
        lastProcessedId = currentId;
        sendNumber(rawNewValue);
      }
    }
  }

  function resetState() {
    if (observerPrint) {
      observerPrint.disconnect();
      observerPrint = null;
    }
    lastProcessedId = null;
  }

  function toggleState() {
    resetState();
    if (location.pathname !== PATH.shelf) {
      return;
    }
    // Настраиваем observer на отслеживание добавления классов подсветки
    observerPrint = new MutationObserver(runScript);
    observerPrint.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"], // Реагируем только на изменение классов на странице
    });
    runScript();
  }

  subscribe(toggleState);
})();
