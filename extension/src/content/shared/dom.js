// Finds DOM elements by selector and text, optionally waiting for their appearance.
(function () {
  function searchText(selector, container, textValue, name, isInclude) {
    const elements = Array.from(container.querySelectorAll(selector));
    let element = elements.find((e) =>
      isInclude
        ? e.textContent?.trim().includes(textValue)
        : e.textContent?.trim() === textValue,
    );

    if (!element) {
      if (name.startsWith("Оплатить")) {
        const text = window.PrintNum.config.TEXT.payAgain;
        if (text) {
          element = elements.find((e) => e.textContent?.trim() === text);
        }
      }
    }

    return element;
  }

  async function waitForElement(
    selector = "",
    textValue = "",
    name = "",
    container = document,
    timeout = 5000,
    isInclude = false,
  ) {
    return new Promise((resolve) => {
      const element = textValue
        ? searchText(selector, container, textValue, name, isInclude)
        : container.querySelector(selector);
      if (element) return resolve(element);

      const observerFind = new MutationObserver(() => {
        const el = textValue
          ? searchText(selector, container, textValue, name, isInclude)
          : container.querySelector(selector);
        if (el) {
          clearTimeout(timer);
          observerFind.disconnect();
          resolve(el);
        }
      });

      observerFind.observe(document.body, { childList: true, subtree: true });

      const timer = setTimeout(() => {
        observerFind.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.dom = { searchText, waitForElement };
})();
