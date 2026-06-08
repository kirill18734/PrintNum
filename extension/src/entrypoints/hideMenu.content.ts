declare const chrome: any;

import { SELECTORS } from "@/utils/constants";
import { subscribe } from "@/utils/observer";
import { waitLoadElement } from "@/utils/find";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    let isRunning = false;
    let lastPathname = "";

    // удаляет ВСЕ цифры на странице (флаг g)
    function formatText(text: string): string {
      return text.replace(/\d+/g, "").trim();
    }

    // Хелпер для сравнения двух массивов без привязки к их порядку
    function areArraysEqual(arr1: string[], arr2: string[]): boolean {
      if (arr1.length !== arr2.length) return false;
      const set2 = new Set(arr2);
      return arr1.every((item) => set2.has(item));
    }

    async function syncData() {
      const { menu = [], offMenu = [] } = await chrome.storage.local.get([
        "menu",
        "offMenu",
      ]);

      const container: any = await waitLoadElement(SELECTORS.containerMenu);
      if (!container) return null;

      const items = [...container.querySelectorAll("a")].map((item) => ({
        element: item,
        name: formatText(item.textContent || ""),
      }));

      const itemsValue = items.map((item) => item.name);

      // Безопасное сравнение структуры меню
      if (!areArraysEqual(itemsValue, menu)) {
        await chrome.storage.local.set({ menu: itemsValue });
      }
      return { items, offMenu };
    }

    async function runScript() {
      if (isRunning) return;
      isRunning = true;

      try {
        const data = await syncData();
        if (!data) return;

        const { items, offMenu } = data;
        // Применение стилей скрытия
        items.forEach((item) => {
          const elem = item.element;
          const isHide = offMenu.includes(item.name);

          if (isHide && elem.style.display !== "none") {
            elem.style.display = "none";
          } else if (!isHide && elem.style.display === "none") {
            elem.style.display = "";
          }
        });
      } catch (err) {
        console.error(`PrintNum: ${err}`);
      } finally {
        isRunning = false;
      }
    }

    function toggleState(curPathname: string) {
      if (curPathname == lastPathname) return;
      lastPathname = curPathname;

      runScript();
    }

    // Подписка на изменения структуры/навигации
    subscribe(toggleState);

    chrome.storage.onChanged.addListener((changes: any) => {
      if (changes.offMenu) {
        runScript();
      }
    });
  },
});
