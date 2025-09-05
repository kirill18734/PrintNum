let last_number = "";
let number_order = "";
let allTrs;
let trElement;
let processingReturn = false;
let resetTimer; // <<< добавлена эта строка

const commandToRun = "82634791520368417952631";
const bnt_return_check = "Проверка";

function convertCyrillicToLatin(input) {
  const layout = {
    ш: "i",
  };
  return input.replace(/[а-яё]/gi, (char) => {
    const lower = char.toLowerCase();
    const isUpper = char !== lower;
    const latin = layout[lower] || char;
    return isUpper ? latin.toUpperCase() : latin;
  });
}

// Эмуляция нажатия на стрелки
function simulateKeyPress(element, key, keyCode) {
  const event = new KeyboardEvent("keydown", {
    key: key,
    keyCode: keyCode,
    which: keyCode,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
}

// Автоматическое ожидание
function waitAndGet(selectorOrCallback, timeout = 3000, interval = 100) {
  return new Promise((resolve, reject) => {
    const isMatch =
      typeof selectorOrCallback === "function"
        ? selectorOrCallback
        : () => document.querySelector(selectorOrCallback);

    const timer = setInterval(() => {
      const result = isMatch();
      if (result) {
        clearInterval(timer);
        clearTimeout(failTimer);
        resolve(result);
      }
    }, interval);

    const failTimer = setTimeout(() => {
      clearInterval(timer);
      console.error(`❌ Элемент не найден в течение ${timeout}мс`); // Лог ошибки
      reject(new Error(`Element not found within ${timeout}ms`));
    }, timeout);
  });
}

async function return_order() {
  if (!trElement) {
    console.error("❌ Не найден trElement, возврат не выполнен."); // Лог если trElement не найден
    return;
  }

  try {
    // Кнопка "Проверка"
    const buttons = trElement.querySelectorAll("button");
    let checkButton;
    for (const btn of buttons) {
      if (btn.textContent.trim() === bnt_return_check) {
        checkButton = btn;
        break;
      }
    }

    // Убираем галочку
    if (checkButton) {
      checkButton.click();
      setTimeout(function () {
        if (trElement) {
          const checkbox = trElement.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.click();
          }
        }
      }, 500);
    }

    // Выбираем причину
    const wrapper = await waitAndGet(() =>
      trElement?.querySelector("._returnGroupReasonSelectWrapper_1v3qc_3")
    );
    const input = await waitAndGet(() =>
      wrapper.querySelector("input.ozi__input__input__-VL68")
    );
    const rect = input.getBoundingClientRect();
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: rect.x + 5,
      clientY: rect.y + 5,
    });

    input.focus();
    input.dispatchEvent(clickEvent);

    // Указываем причину
    await new Promise((resolve) => setTimeout(resolve, 300));
    for (let i = 0; i < 2; i++) {
      simulateKeyPress(input, "ArrowUp", 38);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    simulateKeyPress(input, "Enter", 13);

    // Пауза, чтобы браузер обработал Enter
    await new Promise((resolve) => setTimeout(resolve, 100));

    const activeElement = document.activeElement;

    // Создаем событие keydown для Shift + Tab
    const shiftTabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      code: "Tab",
      keyCode: 9,
      which: 9,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });

    activeElement.dispatchEvent(shiftTabEvent);

    // Переключаем фокус вручную на предыдущий элемент
    const focusableElements = Array.from(
      document.querySelectorAll(
        'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      )
    ).filter((e) => !e.disabled && e.offsetParent !== null);
    const index = focusableElements.indexOf(activeElement);
    if (index > 0) {
      focusableElements[index - 1].focus();
    }
  } catch (err) {
    console.error("❌ Ошибка при выполнении return_order:", err); // Лог ошибки
  } finally {
    // ✅ Всегда очищаем после завершения
    trElement = null;
    number_order = "";
    clearTimeout(resetTimer);
  }
}

document.addEventListener("keydown", async function (event) {
  if (!event.isTrusted) return;

  if (event.key.length === 1) {
    last_number += event.key;
  } else if (event.key === "Enter") {
    if (last_number.trim() != "") {
      if (last_number.length <= 15) {
        number_order = convertCyrillicToLatin(last_number);

        allTrs = document.querySelectorAll('tr[data-testid^="posting-"]');
        if (number_order.includes("ii")) {
          for (const tr of allTrs) {
            if (tr.textContent.includes(number_order)) {
              trElement = tr;
              break;
            }
          }
        } else {
          for (const tr of allTrs) {
            const testId = tr.getAttribute("data-testid");
            if (testId == `posting-${number_order}`) {
              trElement = tr;
              break;
            }
          }
        }

        // Если найден trElement — запускаем таймер на сброс
        if (trElement) {
          clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            trElement = null;
            number_order = "";
          }, 3000);
        }
      } else if (last_number == commandToRun) {
        clearTimeout(resetTimer); // Если пришла команда — отменяем сброс
        if (!processingReturn) {
          processingReturn = true;
          await return_order();
          processingReturn = false;
        }
      }

      last_number = "";
    }
  }
});
