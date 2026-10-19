// Clicks the confirmation button after double Enter on order pages.
(async () => {
  const { PATH, TEXT } = window.PrintNum.config;
  const { waitForElement: waitLoadElement } = window.PrintNum.dom;
  const { listen: listening } = window.PrintNum.keyboard;

  let lastEnterTime = 0;

  listening(async (event) => {
    // Проверяем, что мы на нужной странице
    if (!location.pathname.startsWith(PATH.order)) {
      lastEnterTime = 0;
      return;
    }

    // Игнорируем зажатую клавишу
    if (event.repeat) return;

    const currentTime = Date.now();

    // Если разница между нажатиями меньше 500 миллисекунд
    if (currentTime - lastEnterTime < 500) {
      lastEnterTime = 0; // Сбрасываем время, чтобы предотвратить тройной клик

      const confirmButton = await waitLoadElement(
        "button",
        TEXT.confirm,
        "",
        document,
        500,
      );
      confirmButton?.click();
    } else {
      // Запоминаем время первого нажатия
      lastEnterTime = currentTime;
    }
  }, "Enter");
})();
