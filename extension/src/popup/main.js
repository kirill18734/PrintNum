// Controls popup status, download links, and saved feature toggles.
(function () {
  let downloadUrl = null;
  let isDownloadClicked = false;
  let downloadUrlError = false;

  const openLink = (url) => {
    if (!url) return;
    if (typeof chrome !== "undefined" && chrome.tabs) {
      const fullUrl =
        url.startsWith("/") && !url.startsWith("//")
          ? chrome.runtime.getURL(url)
          : url;
      chrome.tabs.create({ url: fullUrl });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  function updateStatus(isActive) {
    const card = document.getElementById("statusCard");
    const title = document.getElementById("statusTitle");
    const desc = document.getElementById("statusDesc");
    if (!card || !title || !desc) return;

    if (isActive) {
      card.className = "status-card active";
      title.textContent = "Печать активна";
      desc.textContent = "Сервис печати работает";
    } else {
      card.className = "status-card inactive";
    }
  }

  function getOffStorageKey(key) {
    if (!key) return "";
    return "off" + key.charAt(0).toUpperCase() + key.slice(1);
  }

  async function checkPrintService() {
    try {
      const response = await fetch("http://127.0.0.1:5000");
      updateStatus(response.ok);
    } catch {
      updateStatus(false);
    }
  }

  async function loadDownloadUrl() {
    try {
      const response = await fetch(
        "https://printnum-kirill123451.amvera.io/latest.json",
      );
      if (!response.ok) {
        throw new Error(`Не удалось получить ссылку: ${response.status}`);
      }

      const data = await response.json();
      const url = data.platforms?.["windows-x86_64"]?.url;
      if (typeof url !== "string" || !url) {
        throw new Error("В ответе сервера отсутствует ссылка на загрузку");
      }

      downloadUrl = url;
      if (isDownloadClicked) openLink(downloadUrl);
    } catch (error) {
      console.error("Не удалось получить ссылку", error);
      downloadUrlError = true;
      if (isDownloadClicked) showDownloadUrlError();
    }
  }

  function showDownloadUrlError() {
    const desc = document.getElementById("statusDesc");
    if (desc) {
      desc.innerHTML =
        "<span style='color:red'>Ошибка загрузки ссылки</span>";
    }
    isDownloadClicked = false;
  }

  // Network checks run independently; neither delays popup controls.
  checkPrintService();
  loadDownloadUrl();

  document.getElementById("downloadBtn")?.addEventListener("click", () => {
    if (isDownloadClicked) return;
    isDownloadClicked = true;
    const desc = document.getElementById("statusDesc");
    if (desc)
      desc.innerHTML = "<span style='color:gray'>скачивание началось...</span>";
    if (downloadUrl) openLink(downloadUrl);
    else if (downloadUrlError) showDownloadUrlError();
    else if (desc)
      desc.innerHTML =
        "<span style='color:orange'>Получение ссылки... Ожидайте.</span>";
  });

  // Обработка кнопки просмотра PDF (с защитой от открытия аккордеона)
  document.getElementById("print-pdf")?.addEventListener("click", (e) => {
    e.stopPropagation(); // Важно: предотвращает раскрытие/закрытие аккордеона при клике на принтер
    e.preventDefault();
    openLink("/assets/qrCodes.pdf");
  });

  // 3. Динамические аккордеоны
  const accordions = document.querySelectorAll(".sub-accordion");

  accordions.forEach((accordion) => {
    accordion.addEventListener("toggle", async () => {
      if (!accordion.open) return;

      const storageKey = accordion.id;
      if (!storageKey) return;

      const offStorageKey = getOffStorageKey(storageKey);

      // Находим статичные элементы из HTML верстки текущего аккордеона
      const globalToggleBtn = accordion.querySelector(".global-toggle-btn");
      const buttonsListContainer = accordion.querySelector(".buttons-list");

      // Очищаем список кнопок и удаляем старые кастомные счетчики, если они были
      buttonsListContainer.innerHTML = "";
      accordion
        .querySelectorAll(".returns-count-badge, .returns-status-count")
        .forEach((counter) => counter.remove());

      // Сбрасываем классы глобальной кнопки (скрываем её до проверки данных)
      if (globalToggleBtn) {
        globalToggleBtn.className = "global-toggle-btn";
        globalToggleBtn.replaceWith(globalToggleBtn.cloneNode(true)); // Очистка старых EventListeners
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

            // --- НАСТРОЙКА И ОТОБРАЖЕНИЕ ГЛОБАЛЬНОЙ КНОПКИ ИЗ HTML ---
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

              // Слушатель клика для глобальной кнопки
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

            // --- ОТРИСОВКА СПИСКА ОБЫЧНЫХ КНОПОК ---
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
                  const index = currentOffList.indexOf(itemText);

                  if (index > -1) currentOffList.splice(index, 1);
                  else currentOffList.push(itemText);

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
          } else {
            // Если данных нет, глобальная кнопка остается скрытой. Выводим заглушку
            const emptyMessage = document.createElement("span");
            emptyMessage.className = "empty-message";
            emptyMessage.textContent = "Данные отсутствуют";
            buttonsListContainer.appendChild(emptyMessage);
          }
        });
      } else {
        console.error("chrome.storage.local недоступен");
      }
    });
  });
})();
