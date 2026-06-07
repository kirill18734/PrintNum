import { qrCommandsIssueAllOrder, SELECTORS } from "@/utils/constants";
import { listening } from "@/utils/listener";
import { waitLoadElement } from "@/utils/find";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],
  async main() {
    let isRunning = false;

    // ИСПРАВЛЕНО: Исправлена логика проверки элемента (if (!btn))
    async function clickByElem(selector: string, textValue: string) {
      const btn: any = await waitLoadElement(selector, textValue);
      if (!btn) return null;

      btn.click();
      return true;
    }

    async function runScript(actions: string[], commandName: string) {
      if (isRunning) return;
      isRunning = true;

      try {
        const { offQrCodes = [] } = await browser.storage.local.get([
          "offQrCodes",
        ]);
        if (offQrCodes.includes(commandName)) return;

        do {
          for (const action of actions) {
            const isSelector = [
              SELECTORS.packageL,
              SELECTORS.packageM,
            ].includes(action);

            const selector = isSelector ? action : "button";
            const text = isSelector ? "" : action;

            const success = await clickByElem(selector, text);
            if (!success) return; // Прерываем цепочку действий, если один из шагов сорвался
          }
        } while (true);
      } catch (err) {
        console.error(`PrintNum: ${err}`);
      } finally {
        isRunning = false;
      }
    }

    function toggleState(qrId: string) {
      const command = qrCommandsIssueAllOrder.find((item) => item.id == qrId);
      if (!command || location.pathname !== command.pathname) return;

      runScript(command.actions, command.name);
    }

    listening(toggleState);
  },
});
