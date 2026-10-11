// Clicks the confirmation button after Tab then Enter on order pages.
(async () => {
  const { PATH, TEXT } = window.PrintNum.config;
  const { waitForElement: waitLoadElement } = window.PrintNum.dom;
  const { listen: listening } = window.PrintNum.keyboard;

  let tabPressedTimeout;

  listening((event) => {
    if (!location.pathname.startsWith(PATH.order)) {
      clearTimeout(tabPressedTimeout);
      tabPressedTimeout = null;
      return;
    }

    if (event.repeat) return;

    clearTimeout(tabPressedTimeout);
    tabPressedTimeout = setTimeout(() => {
      tabPressedTimeout = null;
    }, 500);
  }, "Tab");

  listening(async (event) => {
    if (!location.pathname.startsWith(PATH.order)) {
      clearTimeout(tabPressedTimeout);
      tabPressedTimeout = null;
      return;
    }

    if (event.repeat || !tabPressedTimeout) return;

    clearTimeout(tabPressedTimeout);
    tabPressedTimeout = null;

    const confirmButton = await waitLoadElement(
      "button",
      TEXT.confirm,
      "",
      document,
      500,
    );
    confirmButton?.click();
  }, "Enter");
})();
