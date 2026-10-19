import type { ChromeApi } from "@/shared/types/chrome-api";
import { isSendPrintNumberResponse } from "@/shared/types/messages";
import { PATH } from "@/shared/constants";
import { subscribe } from "@/shared/dom/observer";

declare const chrome: ChromeApi;

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    let observerPrint: MutationObserver | null = null;
    let lastProcessedId: string | null = null;

    async function sendShelfText(text: string) {
      try {
        const response = await chrome.runtime.sendMessage({
          action: "sendShelfToFlask",
          text,
        });

        if (!isSendPrintNumberResponse(response)) {
          throw new Error("Некорректный ответ фонового скрипта");
        }
        if (!response.success) {
          console.error(`Ошибка сервера (через BG): ${response.error}`);
          return false;
        }
        return true;
      } catch (error) {
        console.error(
          `Ошибка отправки текста полки "${text}" через фоновый скрипт: `,
          error,
        );
        return false;
      }
    }

    function runScript() {
      const headers = Array.from(document.querySelectorAll("thead th"));

      const newCellIndex = headers.findIndex(
        (h) => h.textContent?.trim() === "Новая ячейка",
      );
      const currentCellIndex = headers.findIndex(
        (h) => h.textContent?.trim() === "Текущая ячейка",
      );

      if (newCellIndex === -1 || currentCellIndex === -1) return;

      const highlightedRow = document.querySelector(
        'tbody tr[class*="_highlightedRow_"]',
      );

      if (!highlightedRow) {
        lastProcessedId = null;
        return;
      }

      const cells = highlightedRow.querySelectorAll("td");
      const targetCellNew = cells[newCellIndex];
      const targetCellCurrent = cells[currentCellIndex];

      if (targetCellNew && targetCellCurrent) {
        const currentId = targetCellCurrent.textContent?.trim() || "";
        const rawNewValue = targetCellNew.textContent?.trim() || "";

        if (currentId && currentId !== lastProcessedId && rawNewValue) {
          lastProcessedId = currentId;
          // Отправляем исходный текст без переименований "П-*"
          void sendShelfText(rawNewValue);
        }
      }
    }

    function resetState() {
      if (observerPrint) {
        observerPrint.disconnect();
        observerPrint = null;
      }
      lastProcessedId = null;
    }

    function toggleState() {
      resetState();
      if (location.pathname !== PATH.shelf) {
        return;
      }

      observerPrint = new MutationObserver(runScript);
      observerPrint.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });

      runScript();
    }

    subscribe(toggleState);
  },
});
