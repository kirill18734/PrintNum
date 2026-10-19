import { TEXT } from "@/shared/constants";

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
    if (name.startsWith("Оплатить")) {
      const text = TEXT.payAgain;
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
