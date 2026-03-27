//основной контейнер меню
const notifications = new_tag({
  tag: "div",
  class: ["notifications", "hide-container__wrapper", "wrapper"],
});
//заголовок
const notifications_header = new_tag({
  tag: "div",
  class: ["notifications__header", "wrapper__header"],
  innerHTML: `Уведомления${rightTriangleIcon()}`,
});

// основной контент
const notifications_container = new_tag({
  tag: "div",
  class: ["notifications__container", "wrapper__container"],
});

const notifications_container_items = new_tag({
  tag: "div",
  class: [
    "notifications__container-items",
    "notifications-items",
    "wrapper__container-items",
    "wrapper-items",
  ],
});

// добавление
notifications_container.append(notifications_container_items);
notifications.append(
  notifications_header, // заголовок раздела
  notifications_container, // контент
);
hide_container.append(notifications);

const list_urls = {
  "Выдача заказов": "https://turbo-pvz.ozon.ru/orders",
  Приëмка: "https://turbo-pvz.ozon.ru/receiving-v2/main",
  "Приемка перевозки": "https://turbo-pvz.ozon.ru/carriages_list/current",
  "Прием поставок FBO": "https://turbo-pvz.ozon.ru/inbound_seller",
  Отправка: "https://turbo-pvz.ozon.ru/outbound",
  Посылки: "https://turbo-pvz.ozon.ru/c2c",
  "Возвраты от покупателя": "https://turbo-pvz.ozon.ru/returns-from-customer",
  "Возвраты продавцу": "https://turbo-pvz.ozon.ru/returns_to_seller",
  "Возвраты почты": "https://turbo-pvz.ozon.ru/returns_tpl",
  "Контроль качества": "https://turbo-pvz.ozon.ru/quality-control",
  Отзывы: "https://turbo-pvz.ozon.ru/rating",
  "Поиск предметов": "https://turbo-pvz.ozon.ru/search",
  "Ozon Банк": "https://turbo-pvz.ozon.ru/bank",
  Инвентаризация: "https://turbo-pvz.ozon.ru/inventory",
  Отчёты: "https://turbo-pvz.ozon.ru/reports/remains",
  "Адресное хранение": "https://turbo-pvz.ozon.ru/address_storage",
  Новости: "https://turbo-pvz.ozon.ru/news",
  Обучение: "https://turbo-pvz.ozon.ru/learning",
};

let lastUrlNotification;

function show_list_notifications() {
  let config = get_local_storage("hide");
  // удаляем старый список
  notifications_container_items.innerHTML = "";

  for (const text in list_urls) {
    const is_hide_elem =
      config.notifications.includes(list_urls[text]) &&
      "wrapper-items-value--red";
    const notifications_items_value = new_tag({
      tag: "div",
      class: ["notifications-items-value", is_hide_elem, "wrapper-items-value"],
      innerHTML: text,
    });

    notifications_container_items.append(notifications_items_value);

    notifications_items_value.onclick = () => {
      const isHidden = notifications_items_value.classList.toggle(
        "wrapper-items-value--red",
      );
      if (isHidden) {
        if (!config.notifications.includes(list_urls[text])) {
          config.notifications.push(list_urls[text]);
        }
      } else {
        config.notifications = config.notifications.filter(
          (item) => item !== list_urls[text],
        );
      }

      set_local_storage("hide", config);
    };
  }
}

notifications_header.onclick = () => {
  notifications_container.classList.toggle("wrapper__container--flex");
};

function handleRouteChange(actualUrl) {
  let config = get_local_storage("hide");
  // Скрытие уведомлений
  const shouldHide = config.notifications.some((url) =>
    actualUrl.startsWith(url),
  );

  waitLoadElement("#ozi-notifications-container").then((elem) => {
    elem.classList.toggle("wrapper-items-value--none", shouldHide);
  });

  removeBanners(actualUrl);
}

function removeBanners(currUrl) {
  if (currUrl.startsWith("https://turbo-pvz.ozon.ru/orders")) {
    waitLoadElement('[class*="_bankBanner_"]').then((elem) => {
      elem.classList.add("wrapper-items-value--none");
    });
    waitLoadElement('[class*="_bankWrapper_"]').then((elem) => {
      elem.classList.add("wrapper-items-value--none");
    });
  }
}

if (ENABLE_FEATURE) {
  new MutationObserver(() => {
    const curUrlNotification = location.href;
    if (curUrlNotification !== lastUrlNotification) {
      lastUrlNotification = curUrlNotification;
      show_list_notifications();
      handleRouteChange(curUrlNotification);
    }
  }).observe(document.body, { subtree: true, childList: true });
}
