// =============================
// STATE
// =============================
const state = {
  lastNumber: "",
  lastOrder: null,
  resetTimer: null,
};

// =============================
// CONFIG
// =============================
const WORK_URLS = [
  "https://turbo-pvz.ozon.ru/orders",
  "https://turbo-pvz.ozon.ru/receiving-v2/main",
];

const TEXT = {
  CONTINUE: "Продолжить",
  ISSUE: "Выдать",
  PAY: "Провести оплату",
  PAY_REPEAT: "Попробовать ещё",
  HOME: "На главную",
  READY: "К выдаче",
  RETURN_REASON_1: "Изменил решение о покупке/Товар не подошёл",
  RETURN_REASON_2: "Отказ получателя при вручении",
};

const SELECTOR = {
  // пакеты
  M: 'div:nth-child(1) > [class^="ozi__input__root__"] button',
  L: 'div:nth-child(2) > [class^="ozi__input__root__"] button',
  // приемка
  RECEIVING: "[class^=ozi__toggle__toggle]",
  // отсканированный товар
  scanAnimate: 'div[class^="_scanAnimate_"]',
};

// =============================
// COMMANDS
// =============================
const COMMANDS = {
  "37821563489167429583100": {
    name: "Выдать заказ (без пакета)",
    repeat: false,
    actions: [TEXT.CONTINUE, TEXT.ISSUE, TEXT.HOME],
  },

  "60418273951624830975261": {
    name: "Выдать заказ (+1 пакет M)",
    repeat: false,
    actions: [TEXT.CONTINUE, SELECTOR.M, TEXT.ISSUE, TEXT.HOME],
  },

  "60418273951624830975262": {
    name: "Выдать заказ (+1 пакет L)",
    repeat: false,
    actions: [TEXT.CONTINUE, SELECTOR.L, TEXT.ISSUE, TEXT.HOME],
  },

  "74892015376184239061527": {
    name: "Выдать все (без пакета)",
    repeat: true,
    actions: [TEXT.READY, TEXT.CONTINUE, TEXT.ISSUE, TEXT.HOME],
  },
  "91347265019832476015342": {
    name: "Выдать все (+1 пакет M)",
    repeat: true,
    actions: [TEXT.READY, TEXT.CONTINUE, SELECTOR.M, TEXT.ISSUE, TEXT.HOME],
  },
  "91347265019832476015343": {
    name: "Выдать все (+1 пакет L)",
    repeat: true,
    actions: [TEXT.READY, TEXT.CONTINUE, SELECTOR.L, TEXT.ISSUE, TEXT.HOME],
  },
  "70983625147892016354712": {
    name: "Оплатить заказ (без пакета)",
    repeat: false,
    actions: [TEXT.CONTINUE, TEXT.PAY, TEXT.HOME],
  },
  "70983625147892016354713": {
    name: "Оплатить заказ (+1 пакет M)",
    repeat: false,
    actions: [TEXT.CONTINUE, SELECTOR.M, TEXT.PAY, TEXT.HOME],
  },
  "70983625147892016354714": {
    name: "Оплатить заказ (+1 пакет L)",
    repeat: false,
    actions: [TEXT.CONTINUE, SELECTOR.L, TEXT.PAY, TEXT.HOME],
  },
  "920374615208431975286391": {
    name: "С рекомендацией",
    repeat: false,
    actions: [SELECTOR.RECEIVING],
  },
  "82634791520368417952631": {
    name: "Возврат товара",
    repeat: false,
    actions: [TEXT.READY, TEXT.RETURN_REASON_1],
  },
};

// =============================
// HELPERS
// =============================

function isWorkPage() {
  return WORK_URLS.some((url) => location.href.startsWith(url));
}

async function clickByElem(selector, name, isSelector) {
  try {
    const btn = await waitLoadElement(selector, name, isSelector);

    if (selector === TEXT.READY && name === "Возврат товара") {
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

// =============================
// COMMAND RUNNER
// =============================
async function runCommand(command) {
  do {
    for (const action of command.actions) {
      const isSelector = Object.values(SELECTOR).includes(action);
      const success = await clickByElem(action, command.name, isSelector);
      // необходиомо, чтобы при повторном сканировании код не повторялся
      state.lastOrder = null;

      if (!success) return false;
    }

    if (!command.repeat) break;
  } while (true);

  return true;
}

// =============================
// KEY LISTENER
// =============================
document.addEventListener("keydown", async (e) => {
  if (!isWorkPage()) return;

  if (e.key.length === 1) {
    state.lastNumber += e.key;
    return;
  }

  if (e.key !== "Enter" || !state.lastNumber) return;

  const command = COMMANDS[state.lastNumber];

  state.lastNumber = "";
  // если команда не найдена — считаем это сканом заказа
  if (!command) {
    waitLoadElement(SELECTOR.scanAnimate).then((el) => {
      const listOrders = document.querySelectorAll(SELECTOR.scanAnimate);
      // если в течении 3 сек отсканировали еще второй элемент
      if (listOrders.length > 1) {
        state.lastOrder = null;
        return;
      }
      state.lastOrder = el;
      state.resetTimer = setTimeout(() => {
        state.lastOrder = null;
      }, 3000);
    });
    return;
  }

  if (command.name == "Возврат товара") {
    // исключаем случайного выбора причины возврата, если товар не был отсканирован в течении последних 3 сек
    if (state.resetTimer) clearTimeout(state.resetTimer);
    if (!state.lastOrder) return;
  }

  await runCommand(command);
});
