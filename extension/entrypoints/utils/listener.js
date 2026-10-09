const listFunc = [];
const keyListeners = [];
let lastNumber = "";
let resetTimeout = null;

function listening(fn, key = null) {
  if (key) {
    keyListeners.push({ fn, key });
  } else {
    listFunc.push(fn);
  }
}

window.addEventListener("keydown", (e) => {
  keyListeners.forEach(({ fn, key }) => {
    if (e.key === key) fn(e);
  });

  // Накопление символов от сканера
  if (e.key.length === 1) {
    // Очищаем предыдущий таймер только при вводе нового символа
    if (resetTimeout) clearTimeout(resetTimeout);

    lastNumber += e.key;

    // Сброс буфера через 500 мс
    resetTimeout = setTimeout(() => {
      lastNumber = "";
    }, 500);
    return;
  }

  // Финализация ввода при нажатии Enter
  if (e.key === "Enter") {
    // ОБЯЗАТЕЛЬНО: Отменяем фоновый таймер сброса, так как ввод завершен
    if (resetTimeout) {
      clearTimeout(resetTimeout);
      resetTimeout = null;
    }

    if (lastNumber) {
      listFunc.forEach((fn) => fn(lastNumber));
    }
    lastNumber = "";
  }
}, true);
