(async function () {
  const { autoscripts, TEXT } = window.PrintNum.config;
  const { getLocal: get_local_storage } = window.PrintNum.storage;
  const { waitForElement: waitLoadElement } = window.PrintNum.dom;
  const { subscribe } = window.PrintNum.navigation;

  let isRunning = false;
  let observerConfirmPlacement = null;

  async function runScript(command) {
    if (isRunning) return;
    isRunning = true;

    try {
      const offAutoscripts = (await get_local_storage("offAutoscripts")) || [];
      if (offAutoscripts.includes(command.name)) return;

      const btn = await waitLoadElement("button", TEXT.confirmPlacement);
      if (btn) {
        btn.click();
        // Пауза работает корректно, потому что finally больше её не перезаписывает
        setTimeout(() => {
          isRunning = false;
        }, 200);
      } else {
        isRunning = false;
      }
    } catch (err) {
      console.error(err);
      isRunning = false; // Безопасно освобождаем в случае падения скрипта
    }
  }

  function resetState() {
    if (observerConfirmPlacement) {
      observerConfirmPlacement.disconnect();
      observerConfirmPlacement = null;
    }
    isRunning = false; // Сбрасываем принудительно при смене страницы
  }

  function toggleState() {
    resetState();

    const autoscript = autoscripts?.find(
      (item) => item.id == "confirm-placement",
    );
    if (!autoscript) return;

    if (!location.pathname.startsWith(autoscript.path)) return;

    observerConfirmPlacement = new MutationObserver(() =>
      runScript(autoscript),
    );

    observerConfirmPlacement.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  subscribe(toggleState);
})();
