declare const chrome: any;

import { autoScriptPackage } from "@/utils/constants";
import { listening } from "@/utils/listener";
import { waitLoadElement2 } from "@/utils/find";

export default defineContentScript({
  // Исправлен шаблон матчинга URL
  matches: ["https://turbo-pvz.ozon.ru/*"],

  main() {
    let isRunning = false;

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
          return;
        }

        const btn: any = await waitLoadElement2(
          "button",
          "Завершить",
          "",
          document,
          1000,
        );

        if (!btn) return;

        btn.click();
      } catch (err) {
        console.error(`PrintNum: ${err}`);
      } finally {
        isRunning = false;
      }
    }

    function toggleState(qrId: string) {
      const command = qrCommandsIssueAllOrder.find((item) => item.id == qrId);

      if (command || !location.pathname.startsWith(autoScriptPackage.pathname))
        return;

      runScript(autoScriptPackage.name);
    }

    listening(toggleState);
  },
});
