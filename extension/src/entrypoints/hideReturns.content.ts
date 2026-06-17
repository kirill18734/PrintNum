declare const chrome: any;

import { SELECTORS, workPathNames } from "@/utils/constants";
import { subscribe } from "@/utils/observer";
import { waitLoadElement2 } from "@/utils/find";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  main() {
    let isRunning = false;

    // Хелпер для сравнения двух массивов без привязки к их порядку
    function areArraysEqual(arr1: string[], arr2: string[]): boolean {
      if (arr1.length !== arr2.length) return false;
      const set2 = new Set(arr2);
      return arr1.every((item) => set2.has(item));
    }

    async function syncData() {
      const { returns = [], offReturns = [] } = await chrome.storage.local.get([
        "returns",
        "offReturns",
      ]);
      const titleReturns = await waitLoadElement2(SELECTORS.titleReturns);
      if (!titleReturns) return null;

      const container: any = await waitLoadElement2(SELECTORS.containerReturns);
      if (
        !container ||
        !container.textContent.startsWith("Добавьте содержимое в перевозку")
      )
        return null;

      const items = [...container.querySelectorAll(SELECTORS.itemsReturns)].map(
        (item) => ({
          element: item,
          name:
            item
              .querySelector(SELECTORS.itemTitleReturns)
              ?.textContent?.trim() || "",
        }),
      );
      const itemsValue = [...new Set(items.map((e) => e.name))]; // Удаляем пустые строки, если элемент не нашелся

      if (!areArraysEqual(itemsValue, returns)) {
        await chrome.storage.local.set({ returns: itemsValue });
      }
      return { items, offReturns };
    }

    async function runScript() {
      if (isRunning) return;
      isRunning = true;

      try {
        const data = await syncData();
        if (!data) return;

        const { items, offReturns } = data;
        // Применение стилей скрытия
        items.forEach((item) => {
          const element = item.element;
          const name = item.name;

          const isHide = offReturns.includes(name);
          if (isHide && element.style.display !== "none") {
            element.style.display = "none";
          } else if (!isHide && element.style.display === "none") {
            element.style.display = "";
          }
        });
      } catch (err) {
        console.error(`PrintNum: ${err}`);
      } finally {
        isRunning = false;
      }
    }

    function toggleState() {
      if (!location.href.includes(workPathNames.package)) return;
      runScript();
    }

    // Подписка на изменения структуры/навигации
    subscribe(toggleState);

    // Подписка на изменения из Popup
    chrome.storage.onChanged.addListener((changes: any) => {
      if (changes.offReturns) {
        runScript();
      }
    });
  },
});
