// скрытие банеров
(async function () {
  // Хранилище флагов выполнения для каждого баннера отдельно (чтобы они не блокировали друг друга)
  const runningTasks = new Set();

  async function runScript(bannerConfig, offBannersList) {
    const { name, selector } = bannerConfig;

    // Защита от дребезга конкретно для этого баннера
    if (runningTasks.has(selector)) return;
    runningTasks.add(selector);

    try {
      // Ожидаем элемент на странице
      const bannerElement = await waitLoadElement(selector);
      if (!bannerElement) return;

      // Проверяем, отключен ли этот баннер пользователем
      const shouldHide = offBannersList.includes(name);

      // Управляем отображением
      if (shouldHide && bannerElement.style.display !== "none") {
        bannerElement.style.display = "none";
      } else if (!shouldHide && bannerElement.style.display === "none") {
        bannerElement.style.display = "";
      }
    } catch (err) {
      console.error(err);
    } finally {
      runningTasks.delete(selector);
    }
  }

  async function toggleState() {
    const currentPath = location.pathname;

    // 1. Фильтруем ВСЕ настройки баннеров, которые подходят под текущий URL
    const activeConfigs = banners.filter((item) =>
      currentPath.startsWith(item.path),
    );
    if (!activeConfigs.length) return;

    // 2. Получаем список скрытых баннеров из хранилища ОДИН раз для всех активных настроек
    const offBanners = (await get_local_storage("offBanners")) || [];

    // 3. Запускаем обработку для каждого подходящего баннера
    activeConfigs.forEach((config) => {
      runScript(config, offBanners);
    });
  }

  // Подписка на изменения структуры/навигации страницы
  subscribe(toggleState);

  function handleStorageChange(changes) {
    if (changes.offBanners) {
      toggleState();
    }
  }

  // Подписываемся на изменения в хранилище
  subscribeStorage(handleStorageChange);
})();
