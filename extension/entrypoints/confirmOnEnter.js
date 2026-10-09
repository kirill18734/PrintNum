(async () => {
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
