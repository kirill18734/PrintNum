declare const chrome: any;

import {
  autoScriptBox,
  autoScriptPackage,
  hideBannerAllOrder,
  hideBannerOrder,
  qrCommandRecommendation,
  qrCommandReturnOrder,
  qrCommandsIssueAllOrder,
  qrCommandsIssueOrder,
  qrCommandsPayOrder,
} from "@/utils/constants";

export default defineBackground({
  async main() {
    try {
      // Дефолтные значения
      const namesOther = [hideBannerAllOrder.name, hideBannerOrder.name];
      const namesAutoscripts = [autoScriptPackage.name, autoScriptBox.name];
      const namesQrCommands = [
        ...qrCommandsIssueAllOrder,
        ...qrCommandsIssueOrder,
        ...qrCommandsPayOrder,
        ...qrCommandRecommendation,
        ...qrCommandReturnOrder,
      ].map((item) => item.name);

      // Получаем текущее состояние
      const storage: any = await chrome.storage.local.get([
        "other",
        "autoscripts",
        "offAutoscripts",
        "qrCodes",
        "offQrCodes",
      ]);

      const dataToSet: any = {};

      // Сравнение без учета порядка элементов
      const isDifferent = (
        current: string[] | undefined,
        next: string[],
      ): boolean => {
        if (!Array.isArray(current)) return true;

        const currentSet = new Set(current);
        const nextSet = new Set(next);

        if (currentSet.size !== nextSet.size) {
          return true;
        }

        for (const item of currentSet) {
          if (!nextSet.has(item)) {
            return true;
          }
        }

        return false;
      };

      if (isDifferent(storage.other, namesOther)) {
        dataToSet.other = namesOther;
      }

      if (isDifferent(storage.autoscripts, namesAutoscripts)) {
        dataToSet.autoscripts = namesAutoscripts;
      }

      if (isDifferent(storage.offAutoscripts, namesAutoscripts)) {
        dataToSet.offAutoscripts = namesAutoscripts;
      }

      if (isDifferent(storage.qrCodes, namesQrCommands)) {
        dataToSet.qrCodes = namesQrCommands;
      }

      if (isDifferent(storage.offQrCodes, namesQrCommands)) {
        dataToSet.offQrCodes = namesQrCommands;
      }

      // Записываем только если есть изменения
      if (Object.keys(dataToSet).length > 0) {
        await chrome.storage.local.set(dataToSet);
      }
    } catch (err) {
      console.error(`PrintNum: ${err}`);
    }
  },
});
