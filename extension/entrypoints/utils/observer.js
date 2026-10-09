// Notifies subscribers when client-side navigation changes the current URL.
const listeners = [];

let lastURL = "";

const observer = new MutationObserver(() => {
  const curURL = location.href;
  if (lastURL !== curURL) {
    lastURL = curURL;
    listeners.forEach((fn) => fn());
  }
});

function subscribe(fn) {
  listeners.push(fn);
}

observer.observe(document.body, {
  subtree: true,
  childList: true,
});
