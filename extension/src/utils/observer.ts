export const listeners = [];

export const observer = new MutationObserver(() => {
  const curPathname = location.pathname;
  listeners.forEach((fn) => fn(curPathname));
});

export function subscribe(fn) {
  listeners.push(fn);
}

observer.observe(document.body, {
  subtree: true,
  childList: true,
});
