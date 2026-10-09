// отправка Ozon Полка на печать
(async function () {
  let observerPrint = null;
  let oldElements = new Set();
  let firstRun = true;

  async function sendNumber(number) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "sendNumberToFlask",
        number: number,
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
        const value = targetCell.textContent?.trim() || "";

        if (value) {
          currentElements.push(value);
        }
      }
    });

    const currentSet = new Set(currentElements);

    // Первый запуск — просто запоминаем текущее состояние.
    if (firstRun) {
      oldElements = currentSet;
      firstRun = false;
      return;
    }

    // Находим элементы, которых не было в предыдущем состоянии.
    const newElements = currentElements.filter(
      (item) => !oldElements.has(item),
    );

    // Ничего нового не появилось.
    if (newElements.length === 0) {
      return;
    }

    // Появилось больше одного нового элемента.
    // Сбрасываем старое состояние без отправки на сервер.
    if (newElements.length > 1) {
      console.warn(
        `Обнаружено ${newElements.length} новых элементов. ` +
          `Состояние сброшено без отправки на сервер.`,
      );

      oldElements = currentSet;
      return;
    }

    // Появился ровно один новый элемент.
    const newElement = newElements[0];

    oldElements.add(newElement);

    sendNumber(newElement);
  }

  function resetState() {
    if (observerPrint) {
      observerPrint.disconnect();
      observerPrint = null;
    }

    oldElements = new Set();
    firstRun = true;
  }

  function toggleState() {
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
