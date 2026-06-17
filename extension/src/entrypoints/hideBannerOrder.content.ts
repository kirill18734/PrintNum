declare const chrome: any;

import { hideBannerOrder } from "@/utils/constants";
import { subscribe } from "@/utils/observer";
import { waitLoadElement } from "@/utils/find";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  main() {
    let isRunning = false;

    async function syncData() {
      const { offOther = [] } = await chrome.storage.local.get(["offOther"]);

      const banner: any = await waitLoadElement(hideBannerOrder.action);
      if (!banner) return null;

      const isHide = offOther.includes(hideBannerOrder.name);

      return { banner, isHide };
    }

    async function runScript() {
      if (!location.pathname.startsWith(hideBannerOrder.pathname)) return;

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

    // Подписка на изменения структуры/навигации
    subscribe(runScript);

    chrome.storage.onChanged.addListener((changes: any) => {
      if (changes.offOther) {
        runScript();
      }
    });
  },
});
