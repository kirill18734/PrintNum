// скрытие Меню и Уведомлений
(async function () {
  let isRunning = false;

  // Конфиг исключений и дополнительных данных
  const dopData = [
    { name: "Возвраты от покупателя", url: "returns-from-customer" },
    { name: "Возвраты продавцу", url: "returns_to_seller" },
  ];

  // Мапа для специфических URL, которые не совпадают с href ссылки
  const specialUrls = {
    Отправка: "outbound",
  };

  function formatText(text) {
    return text.replace(/\d+/g, "").trim();
  }

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

  async function runScript() {
    if (isRunning) return;
    isRunning = true;

    try {
      const [
        menuCacheRaw,
        offMenuRaw,
        notificationCacheRaw,
        offNotificationRaw,
      ] = await Promise.all([
        get_local_storage("menu"),
        get_local_storage("offMenu"),
        get_local_storage("notification"),
        get_local_storage("offNotification"),
      ]);

      const menuCache = menuCacheRaw || [];
      const offMenu = offMenuRaw || [];
      const notificationCache = notificationCacheRaw || [];
      const offNotification = offNotificationRaw || [];

      const containerMenu = await waitLoadElement(SELECTOR.menu);
      if (!containerMenu) return;

      const rawLinks = [...containerMenu.querySelectorAll("a")];

      const menuItems = [];
      const notificationItems = [];

      // Оптимизация: Собираем оба массива за ОДИН проход по ссылкам
      rawLinks.forEach((item) => {
        const cleanText = formatText(item.textContent || "");
        const href = item.getAttribute("href") || "";

        menuItems.push({ element: item, name: cleanText });
        notificationItems.push({ name: cleanText, url: href });
      });

      const allNotificationItems = [...notificationItems, ...dopData];

      // Синхронизация структуры меню в фоне
      const currentMenuValues = menuItems.map((item) => item.name);
      const currentNotificationValues = allNotificationItems.map(
        (item) => item.name,
      );

      await Promise.all([
        updateStorageIfNeeded("menu", currentMenuValues, menuCache),
        updateStorageIfNeeded(
          "notification",
          currentNotificationValues,
          notificationCache,
        ),
      ]);

      // --- ЛОГИКА 1: Скрытие пунктов меню ---
      menuItems.forEach((item) => {
        const elem = item.element;
        const isHide = offMenu.includes(item.name);

        if (isHide && elem.style.display !== "none") {
          elem.style.display = "none";
        } else if (!isHide && elem.style.display === "none") {
          elem.style.display = "";
        }
      });

      // --- ЛОГИКА 2: Скрытие контейнера уведомлений ---
      const containerNotification = await waitLoadElement(
        SELECTOR.notification,
      );
      if (containerNotification) {
        const currentPath = location.pathname; // Используем pathname для защиты от ложных совпадений

        const shouldHideNotification = allNotificationItems.some((elem) => {
          if (!offNotification.includes(elem.name)) return false;

          // Проверяем подмену URL через конфиг specialUrls, если совпадений нет — берем elem.url
          const targetURL = specialUrls[elem.name] || elem.url;

          // Безопасная проверка: targetURL должен быть четкой частью пути или равен ему
          return currentPath.includes(targetURL);
        });

        if (
          shouldHideNotification &&
          containerNotification.style.display !== "none"
        ) {
          containerNotification.style.display = "none";
        } else if (
          !shouldHideNotification &&
          containerNotification.style.display === "none"
        ) {
          containerNotification.style.display = "";
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      isRunning = false;
    }
  }

  subscribe(runScript);

  function handleStorageChange(changes) {
    if (changes.offMenu || changes.offNotification) {
      runScript();
    }
  }

  subscribeStorage(handleStorageChange);
})();
