(async function () {
  let downloadUrl = null;
  let isDownloadClicked = false;

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

  // 1. Проверка локального сервера
  try {
    const API_URL = "http://127.0.0.1:5000";
    const res = await fetch(API_URL);
    updateStatus(res.ok);
  } catch (e) {
    updateStatus(false);
  }

  // 2. Ссылка на скачивание
  try {
    const res = await fetch(
      "https://printnum-kirill123451.amvera.io/latest.json",
    );
    const data = await res.json();
    downloadUrl = data.platforms?.["windows-x86_64"]?.url;
    if (isDownloadClicked && downloadUrl) openLink(downloadUrl);
  } catch (e) {
    console.error("Не удалось получить ссылку", e);
    if (isDownloadClicked) {
      const desc = document.getElementById("statusDesc");
      if (desc)
        desc.innerHTML =
          "<span style='color:red'>Ошибка загрузки ссылки</span>";
      isDownloadClicked = false;
    }
  }

  document.getElementById("downloadBtn")?.addEventListener("click", () => {
    if (isDownloadClicked) return;
    isDownloadClicked = true;
    const desc = document.getElementById("statusDesc");
    if (desc)
      desc.innerHTML = "<span style='color:gray'>скачивание началось...</span>";
    if (downloadUrl) openLink(downloadUrl);
    else if (desc)
      desc.innerHTML =
        "<span style='color:orange'>Получение ссылки... Ожидайте.</span>";
  });

  // Обработка кнопки просмотра PDF (с защитой от открытия аккордеона)
  document.getElementById("print-pdf")?.addEventListener("click", (e) => {
    e.stopPropagation(); // Важно: предотвращает раскрытие/закрытие аккордеона при клике на принтер
    e.preventDefault();
    openLink("/qrCodes.pdf");
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
      accordion.querySelector(".returns-count-badge")?.remove();

      // Сбрасываем классы глобальной кнопки (скрываем её до проверки данных)
      if (globalToggleBtn) {
        globalToggleBtn.className = "global-toggle-btn";
        globalToggleBtn.replaceWith(globalToggleBtn.cloneNode(true)); // Очистка старых EventListeners
      }
      const freshGlobalBtn = accordion.querySelector(".global-toggle-btn");

      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.get([storageKey, offStorageKey], (result) => {
          let itemsList = result[storageKey] || [];
          let offList = result[offStorageKey] || [];

          if (Array.isArray(itemsList) && itemsList.length > 0) {
            // Специфичный вывод счетчика для секции возвратов
            if (storageKey === "returns") {
              const countBadge = document.createElement("span");
              countBadge.className = "returns-count-badge";
              countBadge.textContent = `Всего в списке: ${itemsList.length}`;
              // Вставляем счетчик в самое начало перед глобальной кнопкой
              freshGlobalBtn.parentNode.insertBefore(
                countBadge,
                freshGlobalBtn,
              );
            }

            const uniqueItems = [...new Set(itemsList)];

            // --- НАСТРОЙКА И ОТОБРАЖЕНИЕ ГЛОБАЛЬНОЙ КНОПКИ ИЗ HTML ---
            const disabledUniqueCount = uniqueItems.filter((item) =>
              offList.includes(item),
            ).length;
            const shouldEnableAll =
              disabledUniqueCount >= uniqueItems.length / 2;

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
