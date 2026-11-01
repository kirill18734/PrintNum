// Shared HTTP helpers for requests to the local service.
(function () {
  window.PrintNum = window.PrintNum || {};

  window.PrintNum.accordionManager = {
    init() {
      // Обработка кнопки просмотра PDF (с защитой от открытия аккордеона)
      document.getElementById("print-pdf")?.addEventListener("click", (e) => {
        e.stopPropagation(); // Предотвращает раскрытие/закрытие аккордеона при клике на принтер
        e.preventDefault();
        window.PrintNum.utils.openLink("/assets/qrCodes.pdf");
      });

      const accordions = document.querySelectorAll(".sub-accordion");

      accordions.forEach((accordion) => {
        accordion.addEventListener("toggle", async () => {
          if (!accordion.open) return;

          const storageKey = accordion.id;
          if (!storageKey) return;

          const offStorageKey =
            window.PrintNum.utils.getOffStorageKey(storageKey);

          const globalToggleBtn = accordion.querySelector(".global-toggle-btn");
          const buttonsListContainer = accordion.querySelector(".buttons-list");

          // Очищаем списки и счетчики
          buttonsListContainer.innerHTML = "";
          accordion
            .querySelectorAll(".returns-count-badge, .returns-status-count")
            .forEach((counter) => counter.remove());

          if (globalToggleBtn) {
            globalToggleBtn.className = "global-toggle-btn";
            globalToggleBtn.replaceWith(globalToggleBtn.cloneNode(true));
          }
          const freshGlobalBtn = accordion.querySelector(".global-toggle-btn");

          if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get([storageKey, offStorageKey], (result) => {
              const itemsList = Array.isArray(result[storageKey])
                ? result[storageKey]
                : [];
              const offList = Array.isArray(result[offStorageKey])
                ? result[offStorageKey]
                : [];

              if (storageKey === "returns") {
                const disabledCount = itemsList.filter((item) =>
                  offList.includes(item),
                ).length;
                const totalCount = itemsList.length;

                const totalBadge = document.createElement("span");
                totalBadge.className = "returns-count-badge";
                totalBadge.textContent = `Всего в списке: ${totalCount}`;

                const statusBadge = document.createElement("span");
                statusBadge.className = "returns-status-count";
                statusBadge.textContent = `Включено: ${totalCount - disabledCount} · Выключено: ${disabledCount}`;

                const counterContainer = freshGlobalBtn?.parentNode;
                counterContainer?.insertBefore(totalBadge, freshGlobalBtn);
                counterContainer?.insertBefore(statusBadge, freshGlobalBtn);
              }

              if (Array.isArray(itemsList) && itemsList.length > 0) {
                const uniqueItems = [...new Set(itemsList)];
                const itemsForStatusCount =
                  storageKey === "returns" ? itemsList : uniqueItems;

                const disabledCount = itemsForStatusCount.filter((item) =>
                  offList.includes(item),
                ).length;
                const shouldEnableAll =
                  disabledCount >= itemsForStatusCount.length / 2;

                if (freshGlobalBtn) {
                  if (shouldEnableAll) {
                    freshGlobalBtn.classList.add("enable-mode");
                    freshGlobalBtn.textContent = "⚡ Включить все";
                  } else {
                    freshGlobalBtn.classList.add("disable-mode");
                    freshGlobalBtn.textContent = "🛑 Отключить все";
                  }

                  freshGlobalBtn.addEventListener("click", () => {
                    chrome.storage.local.get([offStorageKey], (freshResult) => {
                      let currentOffList = freshResult[offStorageKey] || [];

                      if (shouldEnableAll) {
                        currentOffList = currentOffList.filter(
                          (item) => !uniqueItems.includes(item),
                        );
                      } else {
                        uniqueItems.forEach((item) => {
                          if (!currentOffList.includes(item))
                            currentOffList.push(item);
                        });
                      }

                      chrome.storage.local.set(
                        { [offStorageKey]: currentOffList },
                        () => {
                          accordion.dispatchEvent(new Event("toggle"));
                        },
                      );
                    });
                  });
                }

                // Отрисовка обычных кнопок-тогглов
                uniqueItems.forEach((itemText) => {
                  const button = document.createElement("button");
                  const isOff = offList.includes(itemText);

                  button.textContent = itemText;
                  button.className = isOff
                    ? "status-toggle inactive"
                    : "status-toggle active";

                  button.addEventListener("click", () => {
                    chrome.storage.local.get([offStorageKey], (freshResult) => {
                      let currentOffList = freshResult[offStorageKey] || [];

                      if (isOff) {
                        // Включаем элемент (удаляем из off-списка)
                        currentOffList = currentOffList.filter(
                          (item) => item !== itemText,
                        );
                      } else {
                        // Выключаем элемент (добавляем в off-список)
                        if (!currentOffList.includes(itemText))
                          currentOffList.push(itemText);
                      }

                      chrome.storage.local.set(
                        { [offStorageKey]: currentOffList },
                        () => {
                          accordion.dispatchEvent(new Event("toggle"));
                        },
                      );
                    });
                  });

                  buttonsListContainer.appendChild(button);
                });
              }
            });
          }
        });
      });
    },
  };

  // Главная точка входа. Запускается при полной сборке DOM дерева
  document.addEventListener("DOMContentLoaded", () => {
    window.PrintNum.statusManager.init();
    window.PrintNum.accordionManager.init();
  });
})();
