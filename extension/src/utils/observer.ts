export const listeners: any = [];

let lastURL = "";

export const observer = new MutationObserver(() => {
  const curURL = location.href;
  if (lastURL !== curURL) {
    lastURL = curURL;
    listeners.forEach((fn: any) => fn());
  }
});

export function subscribe(fn: any) {
  listeners.push(fn);
}

observer.observe(document.body, {
  subtree: true,
  childList: true,
});
