const listFunc = [];
let lastNumber = "";
let resetTimeout = null;

function listening(fn) {
  listFunc.push(fn);
}

window.addEventListener("keydown", (e) => {
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
