declare const chrome: any;

import { hideOther, SELECTORS } from "@/utils/constants";
import { subscribe } from "@/utils/observer";
import { waitLoadElement } from "@/utils/find";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    let isRunning = false;

    async function syncData() {
      const { offOther = [] } = await chrome.storage.local.get(["offOther"]);

      const commandName = hideOther.find(
        (elem) => elem.pathname == location.pathname,
      );
      if (!commandName) return null;

      const banner: any = await waitLoadElement(SELECTORS.containerBannerOrder);
      if (!banner) return null;

      const isHide = offOther.includes(commandName.name);

      return { banner, isHide };
    }

    async function runScript() {
      if (isRunning) return;
      isRunning = true;

      try {
        const data = await syncData();
        if (!data) return;

        const { banner, isHide } = data;

        if (isHide && banner.style.display !== "none") {
          banner.style.display = "none";
        } else if (!isHide && banner.style.display === "none") {
          banner.style.display = "";
        }
      } catch (err) {
        console.error(`PrintNum: ${err}`);
      } finally {
        isRunning = false;
      }
    }

    function toggleState() {
      const hideBanner = hideOther.find(
        (elem) => elem.pathname == location.pathname,
      );
      if (!hideBanner) return;

      runScript();
    }

    // Подписка на изменения структуры/навигации
    subscribe(toggleState);

    chrome.storage.onChanged.addListener((changes: any) => {
      if (changes.offOther) {
        runScript();
      }
    });
  },
});
