import { waitLoadElement } from "@/utils/find";
import { get_local_storage } from "@/utils/storage";
import { SELECTOR } from "@/utils/constants";
import { qrCodes } from "@/utils/constants";
import { listening } from "@/utils/listener";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    let isRunning = false;

    const delay = (ms: any) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    async function clickByElem(selector: any, textValue: any, name: any) {
      const btn: any = await waitLoadElement(selector, textValue, name);
      if (!btn) return null;

      btn.click();
      return true;
    }

    // Вспомогательная функция для безопасного включения чекбокса
    async function checkCheckboxOnly(selector: any, textValue: any) {
      const label: any = await waitLoadElement(selector, textValue);
      if (!label) return false;

      const checkbox = label.querySelector('[type="checkbox"]');
      // Кликаем только если чекбокс СЕЙЧАС НЕ отмечен, чтобы не выключить его случайно
      if (checkbox && !checkbox.checked) {
        checkbox.click();
      }
      return true;
    }

    async function runScript(command: any) {
      // ИСПРАВЛЕНО: Теперь защита от параллельного запуска реально работает
      if (isRunning) return;
      isRunning = true;

      try {
        const offQrCodes = (await get_local_storage("offQrCodes")) || [];
        if (offQrCodes.includes(command.name)) return;

        // --- СЦЕНАРИЙ 1: Рекомендации ---
        if (command.group == "recommendation") {
          await checkCheckboxOnly("label", command.name);
          return;
        }

        // --- СЦЕНАРИЙ 2: Обработка цепочки действий ---
        const actions = command.actions || [];

        // Ограничиваем цикл (например, максимум 50 кругов), чтобы вкладка не зависла намертво
        let maxLoops = 50;

        do {
          let allActionsSuccess = true;

          for (const action of actions) {
            const isSelector = [SELECTOR.packageL, SELECTOR.packageM].includes(
              action,
            );
            const selector = isSelector ? action : "button";
            const text = isSelector ? "" : action;

            const success = await clickByElem(selector, text, command.name);

            if (!success) {
              allActionsSuccess = false;
              break; // Ломаем внутренний фор, если кнопка не нашлась
            }
          }

          // ИСПРАВЛЕНО: Если хоть одно действие в цикле выдачи завершилось неудачей
          // (например, закончились заказы на выдачу и кнопка пропала), выходим из цикла loops
          if (!allActionsSuccess) {
            break;
          }

          // Если это цикличная команда, делаем паузу и уменьшаем счетчик аварийного выхода
          if (command.isLoop) {
            await delay(1000);
            maxLoops--;
          }
        } while (command.isLoop && maxLoops > 0);
      } catch (err) {
        console.error(err);
      } finally {
        isRunning = false;
      }
    }

    function toggleState(qrId: any) {
      const command = qrCodes.find((item: any) => item.code == qrId);
      if (!command) return;

      const isPathValid =
        command.group === "issue_all"
          ? location.pathname === command.path
          : location.pathname.startsWith(command.path);

      if (!isPathValid) return;

      runScript(command);
    }

    listening(toggleState);
  },
});
