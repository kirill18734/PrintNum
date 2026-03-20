// основной контейнер раздала
const hide = new_tag({ tag: "div", class: ["hide"] });
// контейнер заголовка раздала
const header_hide = new_tag({
  tag: "div",
  class: ["hide__header"],
  innerHTML: `Скрыть${rightTriangleIcon()}`,
});

// контейнер контента раздела
const hide_container = new_tag({
  tag: "div",
  class: ["hide__container", "hide-container"],
});

// добавление
hide.append(header_hide, hide_container);
main.append(hide);

header_hide.onclick = () =>
  hide_container.classList.toggle("hide__container--flex");

// форматирование текста
function format_text(text) {
  const regex = /\d+/;
  return text.replace(regex, "").trim();
}
