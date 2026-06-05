// Эффективное ожидание элемента через MutationObserver
function searchText(
  selector: string,
  container: any,
  textValue: string,
  name: string,
  isInclude: boolean,
) {
  const elements = Array.from(container.querySelectorAll(selector));
  let element = elements.find((e: any) =>
    isInclude
      ? e.textContent?.trim().includes(textValue)
      : e.textContent?.trim() === textValue,
  );

  if (!element) {
    // для повторной попытки оплатить
    if (name.startsWith("Оплатить")) {
      let text;
      switch (textValue) {
        case TEXT.CONTINUE:
          text = TEXT.PAY_REPEAT;
          break;
        case TEXT.PAY:
          text = TEXT.HOME;
          break;
      }
      // Ищем элемент только если для textValue нашелся запасной вариант текста
      if (text) {
        element = elements.find((e: any) => e.textContent?.trim() === text);
      }
    }
  }

  return element;
}

export async function waitLoadElement(
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
    const observer = new MutationObserver(() => {
      const el = textValue
        ? searchText(selector, container, textValue, name, isInclude)
        : container.querySelector(selector);
      if (el) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 3. Ограничиваем время ожидания
    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`PrintNum: Элемент ${selector} не найден`));
    }, timeout);
  });
}

// автоматическое ожидание элемента
export async function waitLoadElement2(
  selector = "",
  textValue = "",
  name = "",
  container = document,
  timeout = 5000,
  isInclude = false,
) {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    function findElement() {
      const element = textValue
        ? searchText(selector, container, textValue, name, isInclude)
        : container.querySelector(selector);

      if (element) {
        resolve(element);
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`PrintNum: Элемент ${selector} не найден`));
      } else {
        setTimeout(findElement, 300);
      }
    }
    findElement();
  });
}
