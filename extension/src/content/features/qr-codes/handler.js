// обработчики qr-кодов
(async function () {
  const { SELECTOR, PATH, TEXT, qrCodes } = window.PrintNum.config;
  const { getLocal: get_local_storage, setLocal: set_local_storage } =
    window.PrintNum.storage;
  const { waitForElement: waitLoadElement } = window.PrintNum.dom;
  const { listen: listening } = window.PrintNum.keyboard;

  let isRunning = false;

  const packageCycle = [null, SELECTOR.packageM, SELECTOR.packageL];

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ============================================================
  // Получить следующий тип пакета
  // ============================================================

  // ============================================================
  // Получить следующий тип пакета с синхронизацией через Local Storage
  // ============================================================
  async function getNextPackage() {
    // ============================================================
    // ОБЩИЙ СЧЁТЧИК ПАКЕТОВ
    //
    // 0 → без пакета
    // 1 → M
    // 2 → L
    // затем снова 0
    // ============================================================

    // Достаем актуальный индекс из хранилища (если его там нет, по дефолту 0)
    let packageCycleIndex = (await get_local_storage("packageCycleIndex")) || 0;

    // Приводим к числу на всякий случай
    packageCycleIndex = Number(packageCycleIndex);

    const packageSelector = packageCycle[packageCycleIndex];

    // Вычисляем следующий индекс
    const nextIndex = (packageCycleIndex + 1) % packageCycle.length;

    // Сохраняем новый индекс в хранилище для всех вкладок
    await set_local_storage("packageCycleIndex", nextIndex);

    return packageSelector;
  }

  // ============================================================
  // Клик по элементу
  // ============================================================

  async function clickByElem(selector, textValue, name, isLoop) {
    const timeout = isLoop ? 5000 : 1000;
    const btn = await waitLoadElement(
      selector,
      textValue,
      name,
      document,
      timeout,
      false,
      isLoop,
    );
    if (!btn) return null;

    btn.click();
    return true;
  }

  // Вспомогательная функция для безопасного включения чекбокса
  async function selectInputOnly(selector, textValue, type, timeout = 500) {
    const label = await waitLoadElement(
      selector,
      textValue,
      "",
      document,
      timeout,
      true,
    );
    if (!label) return false;

    const input = await waitLoadElement(
      `[type="${type}"]`,
      "",
      "",
      label,
      timeout,
    );

    if (input) {
      input.click();
    }
    return true;
  }

  // ============================================================
  // Выполнение действий
  // ============================================================

  async function executeActions(actions, commandName, isLoop) {
    for (const action of actions) {
      const isPackageSelector = [SELECTOR.packageL, SELECTOR.packageM].includes(
        action,
      );

      const selector = isPackageSelector ? action : "button";

      const text = isPackageSelector ? "" : action;

      const success = await clickByElem(selector, text, commandName, isLoop);

      if (!success) {
        return false;
      }
    }

    return true;
  }

  // ============================================================
  // Получить действия текущей итерации
  // ============================================================

  async function getActionsForIteration(command) {
    let actions = [...(command.actions || [])];

    if (command.group === "package_cycle_workflow") {
      if (location.pathname.startsWith(PATH.order)) {
        actions = [TEXT.issue];
      } else if (location.pathname === PATH.all) {
        actions = [TEXT.ready, TEXT.issue];
      } else {
        return [];
      }
    } else if (command.group !== "package_cycle") {
      return actions;
    }

    const packageSelector = await getNextPackage();

    if (packageSelector && actions.length > 0) {
      actions.splice(actions.length - 1, 0, packageSelector);
    }

    return actions;
  }

  // ============================================================
  // Основная логика
  // ============================================================
  async function runScript(command) {
    // Защита от параллельного запуска
    if (isRunning) return;

    isRunning = true;

    try {
      const offQrCodes = (await get_local_storage("offQrCodes")) || [];

      if (offQrCodes.includes(command.name)) {
        return;
      }

      // ========================================================
      // Рекомендации
      // ========================================================
      if (
        command.group === "recommendation" ||
        command.group === "package_radio"
      ) {
        const inputType =
          command.group === "package_radio" ? "radio" : "checkbox";
        const timeout = command.group === "recommendation" ? 1000 : 500;
        await selectInputOnly("label", command.name, inputType, timeout);
        return;
      }

      // ========================================================
      // Единый цикл для всех команд
      // ========================================================
      const isLoop = command.isLoop && location.pathname === PATH.all;

      let maxLoops = 50;

      do {
        const actions = await getActionsForIteration(command);

        const success = await executeActions(actions, command.name, isLoop);

        // Если действие не выполнилось — прекращаем цикл
        if (!success) {
          break;
        }

        // Для циклических команд ждём секунду
        if (isLoop) {
          await delay(1000);
          maxLoops--;
        }
      } while (isLoop && maxLoops > 0);
    } catch (err) {
      console.error(err);
    } finally {
      isRunning = false;
    }
  }

  function toggleState(qrId) {
    const command = qrCodes.find((item) => item.code == qrId);
    if (!command) return;

    const isPathValid =
      command.group === "package_cycle_workflow"
        ? location.pathname === PATH.all ||
          location.pathname.startsWith(PATH.order)
        : command.group === "issue_all" || command.id === "auto_all"
          ? location.pathname === command.path
          : location.pathname.startsWith(command.path);

    if (!isPathValid) return;

    runScript(command);
  }

  // ============================================================
  // Слушаем сканирование QR
  // ============================================================

  listening(toggleState);
})();
