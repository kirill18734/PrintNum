import { qrCommandRecommendation } from "@/utils/constants";
import { listening } from "@/utils/listener";
import { waitLoadElement } from "@/utils/find";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],
  async main() {
    let isRunning = false;

    async function clickByElem(selector: string, textValue: string) {
      const label: any = await waitLoadElement(selector, textValue);
      if (!label) return null;

      const checkbox = label.querySelector('[type="checkbox"]');
      if (checkbox) checkbox.click();
    }

    async function runScript(commandName: string) {
      if (isRunning) return;
      isRunning = true;

      try {
        const { offQrCodes = [] } = await browser.storage.local.get([
          "offQrCodes",
        ]);

        if (offQrCodes.includes(commandName)) return;

        await clickByElem("label", commandName);
      } catch (err) {
        console.error(`PrintNum: ${err}`);
      } finally {
        isRunning = false;
      }
    }

    function toggleState(qrId: string) {
      const command = qrCommandRecommendation.find((item) => item.id == qrId);

      if (!command || location.pathname !== command.pathname) return;

      runScript(command.name);
    }

    listening(toggleState);
  },
});
