const listFunc: any[] = [];
let lastNumber = "";
let resetTimeout: any = null;

export function listening(fn: (value: string) => void) {
  listFunc.push(fn);
}

window.addEventListener(
  "keydown",
  (e) => {
    if (e.key.length === 1) {
      if (resetTimeout) clearTimeout(resetTimeout);

      lastNumber += e.key;

      resetTimeout = setTimeout(() => {
        lastNumber = "";
      }, 500);
      return;
    }

    if (e.key === "Enter") {
      if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }

      if (lastNumber) {
        listFunc.forEach((fn) => fn(lastNumber));
      }
      lastNumber = "";
    }
  },
  true,
);
