// автоскрипт Перенести таринки в перевозку
(async function () {
  let isRunning = false;
  const autoscriptBox = autoscripts.find((item) => item.id == "box");

  async function runScript() {
    
    if (!location.href.includes(autoscriptBox.path)) return;

    if (isRunning) return;
    isRunning = true;

    try {
      const offAutoscripts = (await get_local_storage("offAutoscripts")) || [];
      if (offAutoscripts.includes(autoscriptBox.name)) return null;

      const titleReturns = await waitLoadElement(SELECTOR.returnTitle);
      if (!titleReturns) return null;

      const container = await waitLoadElement(SELECTOR.returns);
      if (
        !container ||
        !container.textContent.startsWith("Добавьте содержимое в перевозку")
      )
        return null;

      // Ждем появления хотя бы одного элемента списка, чтобы гарантировать загрузку данных
      const firstItem = await waitLoadElement(SELECTOR.returnItem);
      if (!firstItem) return null;

      // Теперь, когда элементы точно на странице, собираем их и кликаем
      container.querySelectorAll(SELECTOR.returnItem).forEach((item) => {
        // 1. Проверяем, содержит ли элемент текст "КТЯ"
        if (!item?.textContent?.includes("КТЯ")) return;

        // 2. Ищем чекбокс внутри этого элемента
        const checkbox = item.querySelector(SELECTOR.boxes);

        // 3. Если чекбокс есть и он не отмечен — кликаем
        if (checkbox && !checkbox.checked) {
          checkbox.click();
        }
      });

      const btn = await waitLoadElement("button", TEXT.move);
      if (!btn) return;

      btn.click();
    } catch (err) {
      console.error(err);
    } finally {
      isRunning = false;
    }
  }

  // Подписка на изменения структуры/навигации (только смена URL)
  subscribe(runScript);

  function handleStorageChange(changes) {
    if (changes.offAutoscripts) {
      runScript();
    }
  }

  // Подписываемся на изменения в хранилище
  subscribeStorage(handleStorageChange);
})();
