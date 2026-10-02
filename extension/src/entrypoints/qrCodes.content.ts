import { waitLoadElement } from "@/utils/find";
import { get_local_storage } from "@/utils/storage";
import { SELECTOR } from "@/utils/constants";
import { qrCodes } from "@/utils/constants";
import { listening } from "@/utils/listener";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  async main() {
    let isRunning = false;

    // ============================================================
    // ОБЩИЙ СЧЁТЧИК ПАКЕТОВ ДЛЯ ТРЁХ НОВЫХ QR
    //
    // 0 → без пакета
    // 1 → M
    // 2 → L
    // затем снова 0
    //
    // ВАЖНО:
    // Счётчик общий для:
    //   auto_all
    //   auto_issue
    //   auto_pay
    // ============================================================

    let packageCycleIndex = 0;

    const packageCycle = [
      null, // 0 — без пакета
      SELECTOR.packageM, // 1 — пакет M
      SELECTOR.packageL, // 2 — пакет L
    ];

    const delay = (ms: any) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // ============================================================
    // Получить следующий тип пакета
    // ============================================================

    function getNextPackage() {
      const packageSelector = packageCycle[packageCycleIndex];

      packageCycleIndex = (packageCycleIndex + 1) % packageCycle.length;

      return packageSelector;
    }

    // ============================================================
    // Клик по элементу
    // ============================================================

    async function clickByElem(selector: any, textValue: any, name: any) {
      const btn: any = await waitLoadElement(selector, textValue, name);

      if (!btn) return null;

      btn.click();

      return true;
    }

    // ============================================================
    // Безопасное включение чекбокса
    // ============================================================

    async function checkCheckboxOnly(selector: any, textValue: any) {
      const label: any = await waitLoadElement(selector, textValue);

      if (!label) return false;

      const checkbox = label.querySelector('[type="checkbox"]');

      if (checkbox) {
        checkbox.click();
      }

      return true;
    }

    // ============================================================
    // Выполнение обычной команды
    // ============================================================

    async function executeActions(actions: any[], commandName: string) {
      for (const action of actions) {
        const isSelector = [SELECTOR.packageL, SELECTOR.packageM].includes(
          action,
        );

        const selector = isSelector ? action : "button";

        const text = isSelector ? "" : action;

        const success = await clickByElem(selector, text, commandName);

        if (!success) {
          return false;
        }
      }

      return true;
    }

    // ============================================================
    // Получить действия для автоматического цикла
    // ============================================================

    function getCycleActions(command: any, packageSelector: any) {
      const actions = [...(command.actions || [])];

      // Без пакета
      if (!packageSelector) {
        return actions;
      }

      // Для auto_all:
      //
      // [TEXT.ready, TEXT.issue]
      //
      // превращаем в:
      //
      // [TEXT.ready, SELECTOR.packageM, TEXT.issue]
      //
      // Для auto_issue:
      //
      // [TEXT.issue]
      //
      // превращаем в:
      //
      // [SELECTOR.packageM, TEXT.issue]
      //
      // Для auto_pay:
      //
      // [TEXT.pay]
      //
      // превращаем в:
      //
      // [SELECTOR.packageM, TEXT.pay]

      if (actions.length > 0) {
        actions.splice(actions.length - 1, 0, packageSelector);
      }

      return actions;
    }

    // ============================================================
    // Основная логика
    // ============================================================

    async function runScript(command: any) {
      // Защита от параллельного запуска
      if (isRunning) return;

      isRunning = true;

      try {
        const offQrCodes = (await get_local_storage("offQrCodes")) || [];

        if (offQrCodes.includes(command.name)) {
          return;
        }

        // ========================================================
        // СЦЕНАРИЙ 1: Рекомендации
        // ========================================================

        if (command.group == "recommendation") {
          await checkCheckboxOnly("label", command.name);

          return;
        }

        // ========================================================
        // СЦЕНАРИЙ 2:
        // Обычные команды
        // ========================================================

        if (command.group !== "package_cycle") {
          const actions = command.actions || [];

          // Максимум 50 кругов
          let maxLoops = 50;

          do {
            const allActionsSuccess = await executeActions(
              actions,
              command.name,
            );

            // Если действие не выполнилось —
            // прекращаем цикл
            if (!allActionsSuccess) {
              break;
            }

            if (command.isLoop) {
              await delay(1000);
              maxLoops--;
            }
          } while (command.isLoop && maxLoops > 0);

          return;
        }

        // ========================================================
        // СЦЕНАРИЙ 3:
        // НОВЫЙ АВТОМАТИЧЕСКИЙ ЦИКЛ
        //
        // Без пакета → M → L → без пакета → ...
        //
        // Один общий счётчик для ВСЕХ трёх QR.
        // ========================================================

        let maxLoops = 50;

        do {
          // Получаем следующий пакет
          //
          // null → без пакета
          // packageM → M
          // packageL → L
          const packageSelector = getNextPackage();

          // Формируем действия
          const actions = getCycleActions(command, packageSelector);

          // Выполняем действия
          const allActionsSuccess = await executeActions(actions, command.name);

          // Если действие не выполнилось,
          // НЕ продолжаем выдачу
          if (!allActionsSuccess) {
            break;
          }

          // Для циклической команды ждём секунду
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

    // ============================================================
    // Обработка QR
    // ============================================================

    function toggleState(qrId: any) {
      const command = qrCodes.find((item: any) => item.code == qrId);

      if (!command) return;

      const isPathValid =
        command.group === "issue_all" || command.group === "package_cycle"
          ? location.pathname === command.path
          : location.pathname.startsWith(command.path);

      if (!isPathValid) return;

      runScript(command);
    }

    // ============================================================
    // Слушаем сканирование QR
    // ============================================================

    listening(toggleState);
  },
});
