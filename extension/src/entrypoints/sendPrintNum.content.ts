import { sendServer } from "@/utils/api";
import { SELECTORS, workPathNames } from "@/utils/constants";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  main() {
    const printedNumbers = new Set();

    let firstRun = false;
    let lastTagsCount = 0;

    const URL = "print-number";

    function sendNumber(number: string) {
      let response = false;
      sendServer
        .post("print-number", { text: number })
        .then(() => {
          response = true;
        })
        .catch(() => {
          response = false;
        });
      return response;
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
      firstRun = false;
      lastTagsCount = 0;
      printedNumbers.clear();
    }

    // отслеживание изменения URL
    new MutationObserver(() => {
      if (location.pathname !== workPathNames.recommendation) {
        resetState();
        return;
      } else {
        runScript();
      }
    }).observe(document, {
      childList: true,
      subtree: true,
    });
  },
});
