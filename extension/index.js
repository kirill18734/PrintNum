// html
// главный контейнер
const container = new_tag({ tag: "div", class: ["container_97cef389"] });
// главная иконка
const topIcon = new_tag({ tag: "div", class: ["topIcon"], textContent: "🎁" });
// содержимое
const main = new_tag({ tag: "main" });

container.append(main, topIcon);
document.body.append(container);

// -------------------------переиспользуемые функции ----------------------------
//хранилище
function get_local_storage(key) {
  return JSON.parse(localStorage.getItem(key)) || false;
}

function set_local_storage(name, cfg) {
  localStorage.setItem(name, JSON.stringify(cfg));
}

function new_tag(data) {
  const elem = document.createElement(data.tag);
  if (data.hasOwnProperty("class")) {
    data.class.forEach((e) => {
      elem.classList.add(e);
    });
  }
  if (data.hasOwnProperty("textContent")) {
    elem.textContent = data.textContent;
  }
  if (data.hasOwnProperty("innerHTML")) {
    elem.innerHTML = data.innerHTML;
  }
  return elem;
}

function searchSelector(selector) {
  return document.querySelector(selector);
}

function searchText(text, name) {
  let element;
  // для оформления возврата

  const container =
    name == "Возврат товара" && text !== TEXT.RETURN_REASON_1
      ? state.lastOrder
      : document;
  let isReturn;
  switch (text) {
    case TEXT.RETURN_REASON_1:
      isReturn = ".tippy-content div";
      break;
    case TEXT.ONCHECK:
    case TEXT.CHECK:
      isReturn = "div";
      break;
    default:
      isReturn = "button";
      break;
  }

  const elements = [...container.querySelectorAll(`${isReturn}`)];

  element = elements.find((e) => e.textContent?.trim() === text);
  if (!element) {
    // для повторной попытки оплатить
    if (name.startsWith("Оплатить")) {
      if (text == TEXT.CONTINUE) {
        element = elements.find(
          (e) => e.textContent?.trim() === TEXT.PAY_REPEAT,
        );
      }
      if (text == TEXT.PAY) {
        element = elements.find((e) => e.textContent?.trim() === TEXT.HOME);
      }
    }
  }
  return element;
}

// автоматическое ожидание элемента
function waitLoadElement(
  selector,
  name = "",
  isSelector = true,
  timeout = 5000,
) {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    function findElement() {
      const element = isSelector
        ? searchSelector(selector)
        : searchText(selector, name);

      if (element) {
        resolve(element);
      } else if (Date.now() - startTime >= timeout) {
        console.error(`Не удалось найти элемент: ${selector}`);
        reject(false);
      } else {
        setTimeout(findElement, 300);
      }
    }
    findElement();
  });
}

function rightTriangleIcon() {
  return `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    class=""
    viewBox="0 0 24 24"
  >
  <path fill="currentColor" d="m10 8 5 4-5 4z"></path>
</svg>
    `;
}

// первый запуск
if (!get_local_storage("hide")) {
  set_local_storage("hide", { menu: [], notifications: [], returns: [] });
}

// прослушиватели событий
topIcon.onclick = () => main.classList.toggle("main--flex");
