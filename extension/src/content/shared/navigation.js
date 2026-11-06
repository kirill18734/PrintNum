// Notifies subscribers when client-side navigation changes the current URL.
(function () {
  const listeners = [];
  let lastURL = "";

  const observer = new MutationObserver(() => {
    const currentURL = location.href;
    if (lastURL !== currentURL) {
      lastURL = currentURL;
      listeners.forEach((listener) => listener());
    }
  });

  function subscribe(listener) {
    listeners.push(listener);
  }

  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.navigation = { subscribe };
})();
