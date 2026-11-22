(async function () {
  const { getLocal: get_local_storage } = window.PrintNum.storage;

  // Keep the public method available while feature settings are initializing.
  // In PROD it remains a no-op; in DEV it delegates to the actual script.
  let runScriptImpl = async () => {};
  window.PrintNum.confirmPlacement = {
    runScript: (...args) => runScriptImpl(...args),
  };

  // Match the feature-mode guard used by the other content scripts.
  await window.PrintNum.featureModeReady;
  const isDevMode = await get_local_storage("isDevMode");
  if (!isDevMode) return;

  const { autoscripts, TEXT } = window.PrintNum.config;
  const { waitForElement: waitLoadElement } = window.PrintNum.dom;

  let isRunning = false;

  // Вспомогательная функция для задержки
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function runScript() {
    if (isRunning) return;
    isRunning = true;

    try {
      // Wait for feature settings initialization and run only in DEV mode.
      await window.PrintNum.featureModeReady;
      const isDevMode = await get_local_storage("isDevMode");
      if (!isDevMode) return;

      const command = autoscripts?.find(
        (item) => item.id == "confirm-placement",
      );
      if (!command) return; // finally сбросит isRunning в false

      const offAutoscripts = (await get_local_storage("offAutoscripts")) || [];
      if (offAutoscripts.includes(command.name)) return; // finally сбросит isRunning в false

      const btn = await waitLoadElement("button", TEXT.confirmPlacement);
      if (btn) {
        btn.click();
        await sleep(200); // Держим флаг true еще 200 мс после клика
      }
    } catch (err) {
      console.error(err);
    } finally {
      isRunning = false; // Гарантированно освобождает флаг в любом сценарии
    }
  }

  runScriptImpl = runScript;
})();
