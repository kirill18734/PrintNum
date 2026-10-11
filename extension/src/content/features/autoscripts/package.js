// автоскрипт Упаковки Ozon нет в наличии
(async function () {
  let isRunning = false;
  let observerPackage = null;
  const autoscriptPackage = autoscripts.find((item) => item.id == "package");

  async function runScript() {
    if (isRunning) return;
    isRunning = true;

    let clicked = false; // Флаг, фиксирующий факт клика в этой итерации

    try {
      const offAutoscripts = (await get_local_storage("offAutoscripts")) || [];
      if (offAutoscripts.includes(autoscriptPackage.name)) return;

      const label = await waitLoadElement(
        "label",
        autoscriptPackage.name,
        "",
        document,
        5000,
        true,
      );

      if (!label) return;

      const radio = await waitLoadElement(
        '[type="radio"]',
        "",
        "",
        label,
        3000,
      );

      if (radio && !radio.checked) {
        radio.click();
        clicked = true; // Запоминаем, что кликнули
        return;
      }
    } catch (err) {
      console.error(err); // Исправлен маркер лога
    } finally {
      if (clicked) {
        // Если был клик, даем интерфейсу 300 мс на обновление,
        // чтобы MutationObserver не вызвал скрипт повторно вхолостую
        setTimeout(() => {
          isRunning = false;
        }, 300);
      } else {
        isRunning = false;
      }
    }
  }

  function resetState() {
    if (observerPackage) {
      observerPackage.disconnect();
      observerPackage = null;
    }
  }

  function toggleState() {
    // Безопасное пересоздание наблюдателя
    resetState();

    if (!location.pathname.includes(autoscriptPackage.path)) {
      return;
    }

    observerPackage = new MutationObserver(() => runScript());
    observerPackage.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Делаем первичный запуск при переходе на страницу, не дожидаясь мутаций
    runScript();
  }

  subscribe(toggleState);
})();
