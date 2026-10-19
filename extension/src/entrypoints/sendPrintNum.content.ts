import type { ChromeApi } from "@/shared/types/chrome-api";
import { isSendPrintNumberResponse } from "@/shared/types/messages";

import { PATH, SELECTOR } from "@/shared/constants";
import { subscribe } from "@/shared/dom/observer";

declare const chrome: ChromeApi;

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    let firstRun = false;
    let observerPrint: any = null;

    let previousTexts: string[] = [];
    let lastSentOrderTag = "";

    async function sendNumber(number: string) {
      try {
        // Отправляем сообщение в Background Script и ждем промис
        const response = await chrome.runtime.sendMessage({
          action: "sendNumberToFlask",
          number: number,
        });

        if (!isSendPrintNumberResponse(response)) {
          throw new Error("Некорректный ответ фонового скрипта");
        }

        // Если фоновый скрипт вернул ошибку или статус неуспеха
        if (!response.success) {
          console.error(`Ошибка сервера (через BG): ${response.error}`);
          return false;
        }

        return true;
      } catch (error) {
        console.error(
          `Ошибка отправки номера ячейки "${number}" через фоновый скрипт: `,
          error,
        );
        return false;
      }
    }

    function getTexts() {
      const tags = document.querySelectorAll(SELECTOR.printNumber);

      return Array.from(tags)
        .map((tag) => tag.textContent?.trim() || "")
        .filter(Boolean)
        .slice(0, 10);
    }

    function areListsEqual(first: string[], second: string[]) {
      if (first.length !== second.length) {
        return false;
      }

      return first.every((text, index) => text === second[index]);
    }

    function runScript() {
      const currentTexts = getTexts();

      if (!currentTexts.length) return;

      // Первый запуск: просто сохраняем список, ничего не отправляем
      if (!firstRun) {
        previousTexts = currentTexts;
        firstRun = true;
        return;
      }

      // Если список не изменился — ничего не делаем
      if (areListsEqual(currentTexts, previousTexts)) {
        return;
      }

      // Список изменился. Фиксируем новый текст
      const newText = currentTexts[0];

      // скрипт НЕ будет пытаться отправить этот номер повторно.
      previousTexts = currentTexts;

      // Отправляем первый текст нового списка в фоновом режиме (без await)
      sendNumber(newText);
    }

    function runOrderScript() {
      const tagElement = document.querySelector(SELECTOR.shelfTagOrder);
      if (!tagElement) return;

      // Используем абсолютно то же форматирование, что и в getTexts()
      const currentText = tagElement.textContent?.trim() || "";

      // Если после форматирования строка оказалась пустой или совпадает с прошлой — выходим
      if (!currentText || currentText === lastSentOrderTag) return;

      lastSentOrderTag = currentText;
      sendNumber(currentText);
    }

    // Главный обработчик изменений на страницах
    function handleMutations() {
      if (location.pathname === PATH.recommendation) {
        runScript();
      } else if (location.pathname.startsWith(PATH.order)) {
        runOrderScript();
      }
    }

    function resetState() {
      if (observerPrint) {
        observerPrint.disconnect();
        observerPrint = null;
      }

      firstRun = false;
      previousTexts = [];
      lastSentOrderTag = ""; // Сбрасываем при смене страницы
    }

    function toggleState() {
      // Исправлено: Гарантированный сброс состояния при любом переходе
      resetState();

      // Проверяем, находимся ли мы на одной из двух целевых страниц
      const isRecommendation = location.pathname === PATH.recommendation;
      const isOrder = location.pathname.startsWith(PATH.order);

      if (!isRecommendation && !isOrder) {
        return;
      }
      // Создаем единый observerPrint для отслеживания изменений DOM
      observerPrint = new MutationObserver(() => handleMutations());

      observerPrint.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Первичный запуск для фиксации исходного состояния элементов
      handleMutations();
    }

    subscribe(toggleState);
  },
});
