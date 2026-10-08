// обработчики qr-кодов
(async function () {
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

  async function clickByElem(selector, textValue, name) {
    const btn = await waitLoadElement(selector, textValue, name);
    if (!btn) return null;

    btn.click();
    return true;
  }

  // Вспомогательная функция для безопасного включения чекбокса
  async function selectInputOnly(selector, textValue, type) {
    const label = await waitLoadElement(
      selector,
      textValue,
      "",
      document,
      500,
      true,
    );
    if (!label) return false;

    const input = await waitLoadElement(`[type="${type}"]`, "", "", label, 300);

    if (input) {
      input.click();
    }
    return true;
  }

  // ============================================================
  // Выполнение действий
  // ============================================================

  async function executeActions(actions, commandName) {
    for (const action of actions) {
      const isPackageSelector = [SELECTOR.packageL, SELECTOR.packageM].includes(
        action,
      );

      const selector = isPackageSelector ? action : "button";

      const text = isPackageSelector ? "" : action;

      const success = await clickByElem(selector, text, commandName);

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
    const actions = [...(command.actions || [])];

    // Обычная команда
    if (command.group !== "package_cycle") {
      return actions;
    }

    // package_cycle:
    // null → обычные actions
    // M    → вставляем M перед последним действием
    // L    → вставляем L перед последним действием

    // Ждем актуальный селектор из хранилища
    const packageSelector = await getNextPackage();

    if (!packageSelector) {
      return actions;
    }

    if (actions.length > 0) {
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
        await selectInputOnly("label", command.name, inputType);
        return;
      }

      // ========================================================
      // Единый цикл для всех команд
      // ========================================================
      let maxLoops = 50;

      do {
        // Добавлено ключевое слово await, так как функция стала асинхронной
        const actions = await getActionsForIteration(command);

        const success = await executeActions(actions, command.name);

        // Если действие не выполнилось — прекращаем цикл
        if (!success) {
          break;
        }

        // Для циклических команд ждём секунду
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

  function toggleState(qrId) {
    const command = qrCodes.find((item) => item.code == qrId);
    if (!command) return;

    const isPathValid =
      command.group === "issue_all" || command.id == "auto_all"
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
