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
      const { notification = [], offNotification = [] } =
        await chrome.storage.local.get(["notification", "offNotification"]);

      const container: any = await waitLoadElement(SELECTORS.containerMenu);
      if (!container) return null;

      const items = [...container.querySelectorAll("a")].map((item) => ({
        element: item,
        name: formatText(item.textContent || ""),
        url: item.getAttribute("href") || "",
      }));

      const itemsValue = items.map((item) => item.name);

      // Безопасное сравнение структуры меню
      if (!areArraysEqual(itemsValue, notification)) {
        await chrome.storage.local.set({ notification: itemsValue });
      }
      return { items, offNotification };
    }

    async function runScript() {
      if (isRunning) return;
      isRunning = true;

      try {
        const data = await syncData();
        if (!data) return;

        const container: any = await waitLoadElement(
          SELECTORS.containerNotification,
        );
        if (!container) return;

        const { items, offNotification } = data;

        const isHide = items.find(
          (elem) =>
            offNotification.includes(elem.name) &&
            location.href.includes(elem.url),
        );

        if (isHide && container.style.display !== "none") {
          container.style.display = "none";
        } else if (!isHide && container.style.display === "none") {
          container.style.display = "";
        }
      } catch (err) {
        console.error(`PrintNum: ${err}`);
      } finally {
        isRunning = false;
      }
    }

    // Подписка на изменения структуры/навигации
    subscribe(runScript);

    chrome.storage.onChanged.addListener((changes: any) => {
      if (changes.offNotification) {
        runScript();
      }
    });
  },
});
