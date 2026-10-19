declare const chrome: any;

import { PATH, SELECTOR } from "../utils/constants";
import { subscribe } from "../utils/observer";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    let firstRun = false;
    let observerPrint: any = null;

    let previousTexts: any = [];

    async function sendNumber(number: any) {
      try {
        // Отправляем сообщение в Background Script и ждем промис
        const response = await chrome.runtime.sendMessage({
          action: "sendNumberToFlask",
          number: number,
        });

        // Если фоновый скрипт вернул ошибку или статус неуспеха
        if (!response || !response.success) {
          console.error(
            `Ошибка сервера (через BG): ${response?.error || "Неизвестная ошибка"}`,
          );
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

    function areListsEqual(first: any, second: any) {
      if (first.length !== second.length) {
        return false;
      }

      return first.every((text: any, index: any) => text === second[index]);
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

    function resetState() {
      if (observerPrint) {
        observerPrint.disconnect();
        observerPrint = null;
      }

      firstRun = false;
      previousTexts = [];
    }

    function toggleState() {
      // Исправлено: Гарантированный сброс состояния при любом переходе
      resetState();

      if (location.pathname !== PATH.recommendation) {
        return;
      }

      // Создаем новый observerPrint
      observerPrint = new MutationObserver(() => runScript());

      observerPrint.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Первичный запуск для фиксации исходного состояния элементов
      runScript();
    }

    subscribe(toggleState);
  },
});
