// Finds DOM elements by selector and text, optionally waiting for their appearance.
(function () {
  const { TEXT, SELECTOR } = window.PrintNum.config;

  function searchText(selector, container, textValue, name, isInclude, isLoop) {
    // 1. Стандартный поиск по селектору и тексту
    const elements = Array.from(container.querySelectorAll(selector));
    let element = elements.find((e) =>
      isInclude
        ? e.textContent?.trim().includes(textValue)
        : e.textContent?.trim() === textValue,
    );

    // Если стандартный элемент найден, сразу возвращаем его
    if (element) return element;

    // Вспомогательная функция для быстрого поиска кнопок по тексту
    const findButtonByText = (text) =>
      Array.from(container.querySelectorAll("button")).find(
        (e) => e.textContent?.trim() === text,
      );

    // 2. Резервное условие для операций оплаты ("Оплатить...")
    if (name && name.startsWith("Оплатить")) {
      return findButtonByText(TEXT.payAgain);
    }

    // 3. Резервное условие для Автосценария
    if (name === "Автосценарий" && !isLoop) {
      const isTargetContext =
        textValue === TEXT.issue ||
        selector === SELECTOR.packageM ||
        selector === SELECTOR.packageL;

      if (isTargetContext) {
        // Сначала пытаемся найти кнопку "Оплатить", если её нет — "Оплатить повторно"
        return findButtonByText(TEXT.pay) || findButtonByText(TEXT.payAgain);
      }
    }

    return null;
  }

  async function waitForElement(
    selector = "",
    textValue = "",
    name = "",
    container = document,
    timeout = 5000,
    isInclude = false,
    isLoop = false,
  ) {
    return new Promise((resolve) => {
      const element = textValue
        ? searchText(selector, container, textValue, name, isInclude, isLoop)
        : container.querySelector(selector);
      if (element) return resolve(element);

      const observerFind = new MutationObserver(() => {
        const el = textValue
          ? searchText(selector, container, textValue, name, isInclude, isLoop)
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
