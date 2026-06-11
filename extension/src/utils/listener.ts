export const listFunc = [];
let lastNumber = "";
let resetTimeout = null;

export function listening(fn) {
  listFunc.push(fn);
}

window.addEventListener("keydown", (e) => {
  if (resetTimeout) clearTimeout(resetTimeout);

  // Накопление символов от сканера
  if (e.key.length === 1) {
    lastNumber += e.key;

    // Сброс буфера через 500 мс (защита от медленного ручного ввода)
    resetTimeout = setTimeout(() => {
      lastNumber = "";
    }, 500);
    return;
  }
  // Финализация ввода при нажатии Enter
  if (e.key === "Enter") {
    if (lastNumber) {
      listFunc.forEach((fn) => fn(lastNumber));
    }
    lastNumber = "";
  }
});
