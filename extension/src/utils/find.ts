// Эффективное ожидание элемента через MutationObserver
import { TEXT } from "./constants";

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
      let text = TEXT.PAY_REPEAT;
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

  return new Promise((resolve) => {
    function findElement() {
      const element = textValue
        ? searchText(selector, container, textValue, name, isInclude)
        : container.querySelector(selector);

      if (element) {
        resolve(element);
      } else if (Date.now() - startTime >= timeout) {
        resolve(null); // Мягкий выход, если страница "не та" и элемента нет
      } else {
        setTimeout(findElement, 250); // Проверка каждые 250мс
      }
    }
    findElement();
  });
}
