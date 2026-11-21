(async function () {
  const { autoscripts, TEXT } = window.PrintNum.config;
  const { getLocal: get_local_storage } = window.PrintNum.storage;
  const { waitForElement: waitLoadElement } = window.PrintNum.dom;

  let isRunning = false;

  // Вспомогательная функция для задержки
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function runScript() {
    if (isRunning) return;
    isRunning = true;

    try {
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

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.confirmPlacement = { runScript };
})();
