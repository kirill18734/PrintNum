declare const chrome: any;

import {
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
      // 1. Собираем дефолтные данные
      const namesOther = [hideBannerAllOrder.name, hideBannerOrder.name];
      const namesAutoscripts = autoScriptPackage.name;
      const namesQrCommands = [
        ...qrCommandsIssueAllOrder,
        ...qrCommandsIssueOrder,
        ...qrCommandsPayOrder,
        ...qrCommandRecommendation,
        ...qrCommandReturnOrder,
      ].map((item) => item.name);

      // 2. Получаем текущее состояние из хранилища
      const storage: any = await chrome.storage.local.get([
        "other",
        "autoscripts",
        "offAutoscripts",
        "qrCodes",
        "offQrCodes",
      ]);

      const dataToSet: any = {};

      // 3. Проверяем строго на undefined (чтобы не затирать пустые массивы пользователя)
      if (storage.other === undefined) {
        dataToSet.other = namesOther;
      }

      if (storage.autoscripts === undefined) {
        dataToSet.autoscripts = [namesAutoscripts];
        dataToSet.offAutoscripts = [namesAutoscripts];
      }

      if (storage.qrCodes === undefined) {
        dataToSet.qrCodes = namesQrCommands; // ИСПРАВЛЕНО: убраны лишние скобки []
        dataToSet.offQrCodes = namesQrCommands; // ИСПРАВЛЕНО: убраны лишние скобки []
      }

      // 4. Записываем всё одним быстрым вызовом, если есть что записывать
      if (Object.keys(dataToSet).length > 0) {
        await chrome.storage.local.set(dataToSet);
      }
    } catch (err) {
      console.error(`PrintNum: ${err}`);
    }
  },
});
