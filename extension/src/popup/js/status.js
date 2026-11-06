// Shared HTTP helpers for requests to the local service.
(function () {
  window.PrintNum = window.PrintNum || {};

  window.PrintNum.statusManager = {
    downloadUrl: null,
    isDownloadClicked: false,
    downloadUrlError: false,

    // Обновление состояния HTML-карточки статуса
    updateStatus(isActive) {
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
    },

    // Проверка запущенного приложения на компьютере пользователя
    async checkPrintService() {
      try {
        const response = await fetch("http://127.0.0.1:5000");
        this.updateStatus(response.ok);
      } catch {
        this.updateStatus(false);
      }
    },

    // Подгрузка манифеста последней версии с сервера
    async loadDownloadUrl() {
      try {
        const response = await fetch(
          "https://printnum.s3.cloud.ru/latest.json",
        );
        if (!response.ok) {
          throw new Error(`Не удалось получить ссылку: ${response.status}`);
        }

        const data = await response.json();
        const url = data.platforms?.["windows-x86_64"]?.url;
        if (typeof url !== "string" || !url) {
          throw new Error("В ответе сервера отсутствует ссылка на загрузку");
        }

        this.downloadUrl = url;
        if (this.isDownloadClicked) {
          window.PrintNum.utils.openLink(this.downloadUrl);
        }
      } catch (error) {
        console.error("Не удалось получить ссылку", error);
        this.downloadUrlError = true;
        if (this.isDownloadClicked) this.showDownloadUrlError();
      }
    },

    showDownloadUrlError() {
      const desc = document.getElementById("statusDesc");
      if (desc) {
        desc.innerHTML =
          "<span style='color:red'>Ошибка загрузки ссылки</span>";
      }
      this.isDownloadClicked = false;
    },

    // Навешивание событий на кнопку скачивания
    init() {
      this.checkPrintService();
      this.loadDownloadUrl();

      document.getElementById("downloadBtn")?.addEventListener("click", () => {
        if (this.isDownloadClicked) return;
        this.isDownloadClicked = true;

        const desc = document.getElementById("statusDesc");
        if (desc) {
          desc.innerHTML =
            "<span style='color:gray'>скачивание началось...</span>";
        }

        if (this.downloadUrl) {
          window.PrintNum.utils.openLink(this.downloadUrl);
        } else if (this.downloadUrlError) {
          this.showDownloadUrlError();
        } else if (desc) {
          desc.innerHTML =
            "<span style='color:orange'>Получение ссылки... Ожидайте.</span>";
        }
      });
    },
  };
})();
