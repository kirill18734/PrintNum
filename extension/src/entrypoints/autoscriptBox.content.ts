declare const chrome: any;

import { autoScriptBox } from "@/utils/constants";
import { SELECTORS, workPathNames } from "@/utils/constants";
import { waitLoadElement2 } from "@/utils/find";
import { subscribe } from "@/utils/observer";

export default defineContentScript({
  // Исправлен шаблон матчинга URL
  matches: ["https://turbo-pvz.ozon.ru/*"],

  main() {
    let isRunning = false;

    async function syncData() {
      const { offAutoscripts = [] } = await chrome.storage.local.get([
        "offAutoscripts",
      ]);
      if (offAutoscripts.includes(autoScriptBox.name)) return null;

      const titleReturns = await waitLoadElement2(SELECTORS.titleReturns);
      if (!titleReturns) return null;

      const container: any = await waitLoadElement2(SELECTORS.containerReturns);
      if (
        !container ||
        !container.textContent.startsWith("Добавьте содержимое в перевозку")
      )
        return null;

      const items = [...container.querySelectorAll(SELECTORS.itemsReturns)]
        .filter(
          (item) =>
            item.querySelector(SELECTORS.itemsBoxes) &&
            item?.textContent?.includes("КТЯ"),
        )
        .map((item) => ({
          element: item, // Родительский DIV (для скрытия/показа)
          name: item.textContent.trim(), // Текст для проверки в offReturns
          // Сохраняем чекбокс сразу, чтобы не искать его заново в цикле кликов
          checkbox: item.querySelector(SELECTORS.itemsBoxes),
        }));

      return { items };
    }

    async function runScript() {
      if (isRunning) return;
      isRunning = true;

      try {
        const data = await syncData();
        if (!data) return;

        const { items } = data;

        // 1. Правильный клик по чекбоксам с использованием сохраненного item.checkbox
        items.forEach((item) => {
          const checkbox = item.checkbox;

          if (checkbox && checkbox.checked === false) {
            checkbox.click();
          }
        });

        // 2. Добавлен await для асинхронного поиска кнопки (по аналогии с waitLoadElement2)
        const btn: any = await waitLoadElement("button", TEXT.MOVE);
        if (!btn) return;

        btn.click();
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
      if (changes.offAutoscripts) {
        runScript();
      }
    });
  },
});
