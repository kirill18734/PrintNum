function searchText(selector, container, textValue, name, isInclude) {
  const elements = Array.from(container.querySelectorAll(selector));
  let element = elements.find((e) =>
    isInclude
      ? e.textContent?.trim().includes(textValue)
      : e.textContent?.trim() === textValue,
  );

  if (!element) {
    // для повторной попытки оплатить
    if (name.startsWith("Оплатить")) {
      let text = TEXT.payAgain;
      // Ищем элемент только если для textValue нашелся запасной вариант текста
      if (text) {
        element = elements.find((e) => e.textContent?.trim() === text);
      }
    }
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
  return new Promise((resolve, reject) => {
    // 1. Проверяем, может элемент уже есть на странице
    const element = textValue
      ? searchText(selector, container, textValue, name, isInclude)
      : container.querySelector(selector);
    if (element) return resolve(element);

    // 2. Если элемента нет, запускаем слежку за DOM
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

    // 3. Ограничиваем время ожидания
    const timer = setTimeout(() => {
      observerFind.disconnect();
      resolve(null); // Мягкий выход вместо reject - чтобы не вызывать необработанные ошибки
    }, timeout);
  });
}
