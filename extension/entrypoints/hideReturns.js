// скрытие возвратов
(async function () {
  let isRunning = false;

  function areArraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    const countMap = {};
    for (const item of arr2) {
      countMap[item] = (countMap[item] || 0) + 1;
    }
    for (const item of arr1) {
      if (!countMap[item]) return false;
      countMap[item]--;
    }
    return true;
  }

  async function updateStorageIfNeeded(key, newValue, oldValue) {
    if (!areArraysEqual(newValue, oldValue)) {
      await set_local_storage(key, newValue);
    }
  }

  async function syncData() {
    const [returnsCache, offReturnsCache] = await Promise.all([
      get_local_storage("returns"),
      get_local_storage("offReturns"),
    ]);

    const returns = returnsCache || [];
    const offReturns = offReturnsCache || [];

    const titleReturns = await waitLoadElement(SELECTOR.returnTitle);
    if (!titleReturns) return null;

    const container = await waitLoadElement(SELECTOR.returns);
    if (
      !container ||
      !container.textContent.startsWith("Добавьте содержимое в перевозку")
    ) {
      return null;
    }

    const items = [];
    const itemsValue = [];

    // Оптимизация: Собираем данные и фильтруем пустые имена за один проход
    container.querySelectorAll(SELECTOR.returnItem).forEach((item) => {
      const name =
        item.querySelector(SELECTOR.returnName)?.textContent?.trim() || "";

      // Игнорируем элементы без имени, чтобы не засорять кэш и настройки
      if (!name) return;

      items.push({ element: item, name });
      itemsValue.push(name);
    });

    // Безопасно обновляем хранилище структуры возвратов
    await updateStorageIfNeeded("returns", itemsValue, returns);

    return { items, offReturns };
  }

  async function runScript() {
    if (!location.href.includes(PATH.package)) return;

    if (isRunning) return;
    isRunning = true;

    try {
      const data = await syncData();
      if (!data) return;

      const { items, offReturns } = data;

      // Применение стилей скрытия
      items.forEach((item) => {
        const { element, name } = item;
        const isHide = offReturns.includes(name);

        if (isHide && element.style.display !== "none") {
          element.style.display = "none";
        } else if (!isHide && element.style.display === "none") {
          element.style.display = "";
        }
      });
    } catch (err) {
      console.error(`Autoscript Returns Error: ${err}`); // Актуальный маркер лога
    } finally {
      isRunning = false;
    }
  }

  // Подписка на изменения структуры/навигации
  subscribe(runScript);

  function handleStorageChange(changes) {
    if (changes.offReturns) {
      runScript();
    }
  }

  // Подписываемся на изменения в хранилище
  subscribeStorage(handleStorageChange);
})();
