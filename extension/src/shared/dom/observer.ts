const listeners: Array<() => void> = [];

let lastURL = "";

const observer = new MutationObserver(() => {
  const curURL = location.href;
  if (lastURL !== curURL) {
    lastURL = curURL;
    listeners.forEach((fn) => fn());
  }
});

export function subscribe(fn: () => void) {
  listeners.push(fn);
}

observer.observe(document.body, {
  subtree: true,
  childList: true,
});
