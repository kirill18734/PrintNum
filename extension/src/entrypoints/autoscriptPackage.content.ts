import { autoScriptPackage } from "@/utils/constants";
import { listening } from "@/utils/listener";
import { waitLoadElement } from "@/utils/find";

export default defineContentScript({
  // Исправлен шаблон матчинга URL
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    let isRunning = false;

    async function runScript(commandName: string) {
      if (isRunning) return;
      isRunning = true;

      try {
        const { offAutoscripts = [] } = await browser.storage.local.get([
          "offAutoscripts",
        ]);
        if (offAutoscripts.includes(commandName)) return;

        const label: any = await waitLoadElement(
          "label",
          commandName,
          "",
          document,
          5000,
          true,
        );
        if (!label) return null;

        const radio: any = await waitLoadElement(
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

        const btn: any = await waitLoadElement(
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

    function toggleState(number: string) {
      if (!location.pathname.startsWith(autoScriptPackage.pathname)) return;

      runScript(autoScriptPackage.name);
    }

    listening(toggleState);
  },
});
