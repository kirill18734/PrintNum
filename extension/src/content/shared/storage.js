// Provides asynchronous helpers for reading and writing extension local storage.
(function () {
  async function getLocal(key) {
    const result = await chrome.storage.local.get(key);

    return Object.prototype.hasOwnProperty.call(result, key)
      ? result[key]
      : false;
  }

  async function setLocal(name, value) {
    await chrome.storage.local.set({ [name]: value });
  }

  window.PrintNum = window.PrintNum || {};
  window.PrintNum.storage = { getLocal, setLocal };
})();
