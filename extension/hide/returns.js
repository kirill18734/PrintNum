//основной контейнер меню
const returns = new_tag({
  tag: "div",
  class: ["returns", "hide-container__wrapper", "wrapper"],
});
//заголовок
const returns_header = new_tag({
  tag: "div",
  class: ["returns__header", "wrapper__header"],
  innerHTML: `Возвраты${rightTriangleIcon()}`,
});

// основной контент
const returns_container = new_tag({
  tag: "div",
  class: ["returns__container", "wrapper__container"],
});

const returns_container_items = new_tag({
  tag: "div",
  class: [
    "returns__container-items",
    "returns-items",
    "wrapper__container-items",
    "wrapper-items",
  ],
});

const workUrlReturn = "https://turbo-pvz.ozon.ru/outbound";

let lastUrlReturn;
// добавление
returns_container.append(returns_container_items);
returns.append(
  returns_header, // заголовок раздела
  returns_container, // контент
);
hide_container.append(returns);

const ozon_container_returns_title = 'div[class^="_breadcrumbsTitle_"]';
const ozon_container_returns = "._block_1b09z_1:nth-of-type(2)";

function show_list_returns() {
  let config = get_local_storage("hide");
  // ожидаем загрузки заголовка для
  waitLoadElement(ozon_container_returns_title).then(() => {
    waitLoadElement(ozon_container_returns).then((element) => {
      if (element.textContent.includes("Добавьте содержимое в перевозку")) {
        returns_container_items.innerHTML = "";

        element
          .querySelectorAll('div[class*="_itemsElement_"]')
          .forEach((e) => {
            const text = e.querySelector(
              'div[class^="_titleWrap_"]',
            ).textContent;

            const is_hide_elem =
              config.returns.includes(text) && "wrapper-items-value--red";
            // при первом запуске скрываем элементы которые уже есть в конфиге
            if (is_hide_elem) {
              e.style.display = "none";
            }
            const returns_items_value = new_tag({
              tag: "div",
              class: [
                "returns-items-value",
                is_hide_elem,
                "wrapper-items-value",
              ],
              innerHTML: text,
            });

            returns_container_items.append(returns_items_value);

            returns_items_value.onclick = () => {
              const isHidden = returns_items_value.classList.toggle(
                "wrapper-items-value--red",
              );
              if (isHidden) {
                if (!config.returns.includes(text)) {
                  config.returns.push(text);
                }
                e.style.display = "none";
              } else {
                config.returns = config.returns.filter((item) => item !== text);
                e.style.display = "flex";
              }

              set_local_storage("hide", config);
            };
          });
      }
    });
  });
}

returns_header.onclick = () => {
  returns_container.classList.toggle("wrapper__container--flex");
};

setInterval(() => {
  const currentUrlReturn = location.href;
  if (currentUrlReturn.startsWith(workUrlReturn)) {
    show_list_returns();
  }
}, 500);
