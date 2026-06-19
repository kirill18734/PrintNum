declare const chrome: any;

import { autoScriptPackage } from "@/utils/constants";
import { waitLoadElement2 } from "@/utils/find";
import { subscribe } from "@/utils/observer";

export default defineContentScript({
  // Исправлен шаблон матчинга URL
  matches: ["https://turbo-pvz.ozon.ru/*"],

  main() {
    let isRunning = false;
    let observer: any = null;

    async function runScript(commandName: string) {
      if (isRunning) return;
      isRunning = true;

      try {
        const { offAutoscripts = [] } = await chrome.storage.local.get([
          "offAutoscripts",
        ]);
        if (offAutoscripts.includes(commandName)) return;

        const label: any = await waitLoadElement2(
          "label",
          commandName,
          "",
          document,
          5000,
          true,
        );

        if (!label) return null;

        const radio: any = await waitLoadElement2(
          '[type="radio"]',
          "",
          "",
          label,
          3000,
        );

        if (radio && !radio.checked) {
          radio.click();
          await new Promise((resolve) => setTimeout(resolve, 300));
          return;
        }

        const btn: any = await waitLoadElement2(
          "button",
          "Завершить",
          "",
          document,
          2000,
        );

        if (!btn) return;

        btn.click();
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (err) {
        console.error(`PrintNum: ${err}`);
      } finally {
        isRunning = false;
      }
    }

    function resetState() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }

    function toggleState() {
      if (observer) resetState();

      if (!location.pathname.includes(autoScriptPackage.pathname)) {
        // Если ушли с целевой страницы — полностью очищаем состояние и выходим
        resetState();
        return;
      }

      // 2. Создаем обсервер только убедившись, что старый уничтожен
      observer = new MutationObserver(() => runScript(autoScriptPackage.name));

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    subscribe(toggleState);
  },
});
