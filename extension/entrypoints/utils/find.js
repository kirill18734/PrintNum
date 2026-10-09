function searchText(
  selector,
  container,
  textValue,
  name,
  isInclude,
  allowFallbacks,
) {
  const elements = Array.from(container.querySelectorAll(selector));
  let element = elements.find((e) =>
    isInclude
      ? e.textContent?.trim().includes(textValue)
      : e.textContent?.trim() === textValue,
  );

  if (!element && allowFallbacks) {
    const fallbackTexts = [];
    if (name.startsWith("Оплатить")) {
      fallbackTexts.push(TEXT.payAgain);
    }
    if (name.startsWith("Оплатить") || name.startsWith("Выдать заказ")) {
      fallbackTexts.push(TEXT.confirm);
    }
    element = elements.find((e) =>
      fallbackTexts.includes(e.textContent?.trim()),
    );
  }

  return element;
}

async function waitLoadElement(
  selector = "",
  textValue = "",
  name = "",
  container = document,
  timeout = 5000,
  isInclude = false,
) {
  const fallbackDeadline = Date.now() + 500;

  return new Promise((resolve, reject) => {
    // 1. Проверяем, может элемент уже есть на странице
    const element = textValue
      ? searchText(
          selector,
          container,
          textValue,
          name,
          isInclude,
          Date.now() < fallbackDeadline,
        )
      : container.querySelector(selector);
    if (element) return resolve(element);

    // 2. Если элемента нет, запускаем слежку за DOM
    const observerFind = new MutationObserver(() => {
      const el = textValue
        ? searchText(
            selector,
            container,
            textValue,
            name,
            isInclude,
            Date.now() < fallbackDeadline,
          )
        : container.querySelector(selector);
      if (el) {
        clearTimeout(timer);
        observerFind.disconnect();
        resolve(el);
      }
    });

    observerFind.observe(document.body, { childList: true, subtree: true });

    // 3. Ограничиваем время ожидания
    const timer = setTimeout(() => {
      observerFind.disconnect();
      resolve(null); // Мягкий выход вместо reject - чтобы не вызывать необработанные ошибки
    }, timeout);
  });
}
