import {
  qrCommandReturnOrder,
  SELECTORS,
  workPathNames,
} from "@/utils/constants";
import { waitLoadElement } from "@/utils/find";
import { listening } from "@/utils/listener";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    let isRunning = false;
    let lastOrder: any = null;
    let resetTimer: any = null;

    async function clickByElem(
      selector: string,
      textValue: string,
      container: any,
    ) {
      try {
        const btn: any = await waitLoadElement(
          selector,
          textValue,
          "",
          container,
        );

        if (textValue === TEXT.READY) {
          btn.dispatchEvent(new MouseEvent("click"));
          await new Promise((r) => setTimeout(r, 500));
        } else {
          btn.click();
        }

        return true;
      } catch {
        return false;
      }
    }

    async function runScript(
      curOrder: any,
      actions: string[],
      commandName: string,
    ) {
      if (isRunning) return;
      isRunning = true;

      try {
        const { offQrCodes = [] } = await browser.storage.local.get([
          "offQrCodes",
        ]);
        if (offQrCodes.includes(commandName)) return;

        for (const action of actions) {
          const container =
            action == TEXT.RETURN_REASON_1 ? document : curOrder;

          let selector = "";
          switch (action) {
            case TEXT.RETURN_REASON_1:
              selector = ".tippy-content div";
              break;
            case TEXT.ONCHECK:
            case TEXT.CHECK:
              selector = "div";
              break;
            default:
              selector = "button";
              break;
          }

          const success = await clickByElem(selector, action, container);
          if (!success) return;
        }
      } catch (err) {
        console.error(`PrintNum: ${err}`);
      } finally {
        isRunning = false;
      }
    }

    async function toggleState(qrId: string) {
      if (!location.pathname.startsWith(workPathNames.order)) return;

      const command: any = qrCommandReturnOrder.find((item) => item.id == qrId);

      if (!command) {
        lastOrder = null;

        const order = await waitLoadElement2(
          SELECTORS.scanOrder,
          "",
          "",
          document,
          3000,
        );

        if (!order) return;

        lastOrder = order;
        // Запускаем окно в 3 секунды, в течение которого нужно отсканировать команду

        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          lastOrder = null;
        }, 3000);
        return;
      }

      if (resetTimer) clearTimeout(resetTimer);
      if (!lastOrder) return;

      const curOrder = lastOrder;
      lastOrder = null;

      runScript(curOrder, command.actions, command.name);
    }

    listening(toggleState);
  },
});
