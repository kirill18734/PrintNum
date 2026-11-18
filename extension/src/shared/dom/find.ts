function searchText(
  selector: string,
  container: any,
  textValue: string,
  isInclude: boolean,
) {
  const elements = Array.from(container.querySelectorAll(selector));
  return elements.find((e: any) =>
    isInclude
      ? e.textContent?.trim().includes(textValue)
      : e.textContent?.trim() === textValue,
  );
}

export async function waitLoadElement(
  selector = "",
  textValue = "",
  _name = "",
  container = document,
  timeout = 200,
  isInclude = false,
) {
  return new Promise((resolve) => {
    const element = textValue
      ? searchText(selector, container, textValue, isInclude)
      : container.querySelector(selector);
    if (element) return resolve(element);

    const observerFind = new MutationObserver(() => {
      const el = textValue
        ? searchText(selector, container, textValue, isInclude)
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
