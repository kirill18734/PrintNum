//основной контейнер меню
const menu = new_tag({
  tag: "div",
  class: ["menu", "hide-container__wrapper", "wrapper"],
});
//заголовок
const menu_header = new_tag({
  tag: "div",
  class: ["menu__header", "wrapper__header"],
  innerHTML: `Меню${rightTriangleIcon()}`,
});

// основной контент
const menu_container = new_tag({
  tag: "div",
  class: ["menu__container", "wrapper__container"],
});

const menu_container_items = new_tag({
  tag: "div",
  class: [
    "menu__container-items",
    "menu-items",
    "wrapper__container-items",
    "wrapper-items",
  ],
});

// добавление
menu_container.append(menu_container_items);
menu.append(
  menu_header, // заголовок раздела
  menu_container, // контент
);
hide_container.append(menu);

const ozon_menuContent = 'div[class^="_menuContent_"]';

function show_list_menu() {
  let config = get_local_storage("hide");
  waitLoadElement(ozon_menuContent).then((element) => {
    // удаляем старый список
    menu_container_items.innerHTML = "";

    element.querySelectorAll("a").forEach((e) => {
      const text = format_text(e.textContent);
      const isHidden = config.menu.includes(text);
      // при первом запуске скрываем элементы которые уже есть в конфиге
      if (isHidden) {
        e.classList.add("wrapper-items-value--none");
      } else {
        e.classList.remove("wrapper-items-value--none");
      }
      const menu_items_value = new_tag({
        tag: "div",
        class: [
          "menu-items-value",
          ...(isHidden ? ["wrapper-items-value--red"] : []),
          "wrapper-items-value",
        ],
        innerHTML: text,
      });

      menu_container_items.append(menu_items_value);

      menu_items_value.onclick = () => {
        const isHidden = menu_items_value.classList.toggle(
          "wrapper-items-value--red",
        );
        e.classList.toggle("wrapper-items-value--none", isHidden);

        if (isHidden) {
          if (!config.menu.includes(text)) {
            config.menu.push(text);
          }
        } else {
          config.menu = config.menu.filter((item) => item !== text);
        }
        set_local_storage("hide", config);
      };
    });
  });
}

menu_header.onclick = () => {
  menu_container.classList.toggle("wrapper__container--flex");
};
let lastURLMenu;

if (ENABLE_FEATURE) {
  // отслеживание изменения URL
  new MutationObserver(() => {
    const curURLMenu = location.href;
    if (lastURLMenu !== curURLMenu) {
      lastURLMenu = curURLMenu;
      show_list_menu();
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
  });
}
