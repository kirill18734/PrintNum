declare const chrome: any;

import { SELECTORS } from "@/utils/constants";
import { subscribe } from "@/utils/observer";
import { waitLoadElement } from "@/utils/find";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    let isRunning = false;

    const dopData = [
      { name: "Возвраты от покупателя", url: "returns-from-customer" },
      { name: "Возвраты продавцу", url: "returns_to_seller" },
    ];

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
        name: formatText(item.textContent || ""),
        url: item.getAttribute("href") || "",
      }));
      const allItems = [...items, ...dopData];

      const itemsValue = allItems.map((item) => item.name);

      // Безопасное сравнение структуры меню
      if (!areArraysEqual(itemsValue, notification)) {
        await chrome.storage.local.set({
          notification: itemsValue,
        });
      }
      return { allItems, offNotification };
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

        const { allItems, offNotification } = data;

        const isHide = allItems.find((elem: any) => {
          const isHide = offNotification.includes(elem.name);
          // корректирование ссылки
          let URL;
          switch (elem.name) {
            case "Отправка":
              URL = "outbound";
              break;
            default:
              URL = elem.url;
              break;
          }

          return isHide && location.href.includes(URL);
        });

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
