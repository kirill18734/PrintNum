import { sendServer } from "@/utils/api";
import { SELECTORS, workPathNames } from "@/utils/constants";
import { subscribe } from "@/utils/observer";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    const printedNumbers = new Set<string>();

    let firstRun = false;
    let lastTagsCount = 0;
    let observer: any = null;

    const URL = "print-number";

    async function sendNumber(number: string): Promise<boolean> {
      try {
        const response = await sendServer.post(URL, { text: number });

        if (!response.ok) {
          console.error(
            `Ошибка сервера: ${response.status} ${response.statusText}`,
          );
          return false;
        }

        return true;
      } catch (error) {
        console.error("Ошибка отправки номера:", error);
        return false;
      }
    }

    function runScript() {
      const tags = document.querySelectorAll(SELECTORS.numprint);
      if (!tags.length) return;

      const number = tags[0].textContent?.trim();
      if (!number) return;

      const tagsCount = tags.length;

      // Первый найденный номер пропускаем
      if (!firstRun) {
        printedNumbers.add(number);
        lastTagsCount = tagsCount;
        firstRun = true;
        return;
      }

      const isNewNumber = !printedNumbers.has(number);
      const tagsChanged = tagsCount !== lastTagsCount;

      if (isNewNumber) {
        sendNumber(number);
        printedNumbers.add(number);
      } else if (tagsChanged) {
        sendNumber(number);
      }

      lastTagsCount = tagsCount;
    }

    function resetState() {
      if (observer) {
        observer.disconnect();
        observer = null; // Обязательно зануляем ссылку
      }
      firstRun = false;
      lastTagsCount = 0;
      printedNumbers.clear();
    }

    function toggleState() {
      // 1. ПЕРВЫМ ДЕЛОМ всегда очищаем старый обсервер, предотвращая утечку памяти
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      if (location.pathname !== workPathNames.recommendation) {
        resetState();
        return;
      }

      // 2. Создаем обсервер только убедившись, что старый уничтожен
      observer = new MutationObserver(() => runScript());

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    subscribe(toggleState);
  },
});
