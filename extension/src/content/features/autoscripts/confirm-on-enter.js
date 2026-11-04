// Clicks the confirmation button after double Enter on order pages.
(async () => {
  const { TEXT, autoscripts } = window.PrintNum.config;
  const { waitForElement: waitLoadElement } = window.PrintNum.dom;
  const { listen: listening } = window.PrintNum.keyboard;
  const { getLocal: get_local_storage } = window.PrintNum.storage;

  let lastEnterTime = 0;
  let isRunning = false;

  // Функция выполняет ТОЛЬКО проверку хранилища и клик
  async function runScript(command) {
    if (isRunning) return;
    isRunning = true;

    try {
      const offAutoscripts = (await get_local_storage("offAutoscripts")) || [];
      if (offAutoscripts.includes(command.name)) return;

      const btn = await waitLoadElement(
        "button",
        TEXT.confirm,
        "",
        document,
        500,
      );

      if (btn) {
        btn.click();

        setTimeout(() => {
          isRunning = false;
        }, 200);
      } else {
        isRunning = false;
      }
    } catch (err) {
      console.error(err);
    } finally {
      isRunning = false;
    }
  }

  async function toggleState(event) {
    // Игнорируем зажатую клавишу
    if (event.repeat) return;

    const autoscript = autoscripts?.find((item) => item.id == "confirm");
    if (!autoscript) return;

    // Проверяем, что мы на нужной странице
    if (!location.pathname.startsWith(autoscript.path)) {
      lastEnterTime = 0;
      return;
    }

    const currentTime = Date.now();

    // Проверяем двойное нажатие (интервал меньше 500 мс)
    if (currentTime - lastEnterTime < 500) {
      lastEnterTime = 0; // Сбрасываем таймер для предотвращения тройного клика
      await runScript(autoscript); // Передаем корректное имя переменной
    } else {
      lastEnterTime = currentTime; // Запоминаем время первого нажатия
    }
  }

  // ============================================================
  // Слушаем сканирование QR / Нажатие Enter
  // ============================================================

  listening(toggleState, "Enter");
})();
