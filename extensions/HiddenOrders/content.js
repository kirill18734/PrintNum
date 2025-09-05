// Каждая группа — это массив слов, которые должны встречаться все вместе
const keywordGroups = [
  ["Угги", "ii9082036526", "Возврат-2"],
  ["Нож кухонный накири, Samura Shadow SH-0043", "Возврат-1", "ii11407471334"],
  [
    "PlayStation 5 DualSense Gray Camouflage Беспроводной геймпад",
    "ii9447963153",
  ],
];

const work_url = "https://turbo-pvz.ozon.ru/outbound";
const classPrefix = "_element";
const timeout = 300;

let prevUrl = undefined;
let timerId;

// Проверяем, содержит ли текст все слова из какой-то группы
function matchesAnyGroup(text) {
  return keywordGroups.some((group) =>
    group.every((keyword) => text.includes(keyword))
  );
}
// удаление элементов
function removeTargetDivs() {
  document.querySelectorAll(`div[class^="${classPrefix}"]`).forEach((div) => {
    const text = div.textContent;
    if (matchesAnyGroup(text)) {
      div.remove();
      console.error(
        "❌ Удалён элемент, содержащий все слова из одной из групп:",
        div
      );
    }
  });
}

setInterval(() => {
  const currUrl = window.location.href;
  if (currUrl != prevUrl) {
    if (currUrl.includes(work_url)) {
      timerId = setInterval(removeTargetDivs, timeout);
    } else {
      clearInterval(timerId);
    }
    prevUrl = currUrl;
  }
}, timeout);
