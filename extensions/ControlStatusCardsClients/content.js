let buffer = "";

const timeout = 3000;
const work_url = [
  "https://turbo-pvz.ozon.ru/orders",
  "https://turbo-pvz.ozon.ru/receiving-v2/main",
];

const list_commands = {
  command1: {
    name: "Выдать заказ (без пакета)",
    code: "37821563489167429583100",
    search_btn: [
      "text:Продолжить",
      "text:Не выдавать пакеты",
      "text:Выдать",
      "text:На главную",
    ],
  },
  command2: {
    name: "Выдать заказ (+1 пакет)",
    code: "60418273951624830975261",
    search_btn: [
      "text:Продолжить",
      'button[class*="increment"]',
      "text:Выдать 1 пакет",
      "text:Выдать",
      "text:На главную",
    ],
  },
  command3: {
    name: "Автораспределение",
    code: "920374615208431975286391",
    search_btn: ["input.ozi__toggle__toggle__2ImSG"],
  },
  command4: {
    name: "Выдать все (+1 пакет)",
    code: "91347265019832476015342",
    search_btn: [
      "text:К выдаче",
      "text:Продолжить",
      'button[class*="increment"]',
      "text:Выдать 1 пакет",
      "text:Выдать",
      "text:На главную",
    ],
  },
  command5: {
    name: "Выдать все (без пакета)",
    code: "74892015376184239061527",
    search_btn: [
      "text:К выдаче",
      "text:Продолжить",
      "text:Не выдавать пакеты",
      "text:Выдать",
      "text:На главную",
    ],
  },
  command6: {
    name: "Оплатить заказ (без пакета)",
    code: "70983625147892016354712",
    search_btn: ["text:Продолжить", "text:Не выдавать пакеты", "text:Оплатить"],
  },
};

// Универсальная функция ожидания и клика
async function btn_click(target) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function tryClick() {
      let btn = null;

      if (target.startsWith("text:")) {
        const text = target.slice(5).trim().toLowerCase();
        btn = [...document.querySelectorAll("button, [role='button']")].find(
          (el) => el.textContent.trim().toLowerCase().includes(text)
        );
      } else {
        btn = document.querySelector(target);
      }

      if (btn) {
        btn.click();
        resolve(true);
      } else if (Date.now() - startTime >= timeout) {
        console.error(`❌ Не удалось найти элемент ${target} за ${timeout} мс`); // Лог ошибки, если элемент не найден
        reject(false);
      } else {
        requestAnimationFrame(tryClick);
      }
    }
    tryClick();
  });
}

//основная функция по запуску
async function run(list_btn) {
  for (let btn of list_btn) {
    try {
      await btn_click(btn);
    } catch (err) {
      break;
    }
  }
}

// Проверка существования элемента по тексту
function elementWithTextExists(text) {
  return [...document.querySelectorAll("button, [role='button']")].some((el) =>
    el.textContent.toLowerCase().includes(text.slice(5).trim().toLowerCase())
  );
}

// Обработка комбинации
async function handleCombination(list_btn) {
  if (list_btn) {
    if (list_btn.includes("text:К выдаче")) {
      while (elementWithTextExists(list_btn[0])) {
        await run(list_btn);
      }
      return;
    }
    await run(list_btn);
  } else console.log("Переданный список пустой");
}

document.addEventListener("keydown", async (num) => {
  const currUrl = window.location.href;
  if (work_url.includes(currUrl)) {
    if (num.key.length === 1) {
      buffer += num.key;
    } else if (num.key === "Enter" && buffer) {
      for (const val of Object.values(list_commands)) {
        if (buffer == val.code) {
          await handleCombination(val.search_btn);
          break;
        }
      }
      buffer = "";
    }
  }
});
