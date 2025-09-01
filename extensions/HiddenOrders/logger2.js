(function () {
  // Каждая группа — это массив слов, которые должны встречаться все вместе
  const keywordGroups = [
    ["Угги", "ii9082036526", "Возврат-2"],
    ["Нож кухонный накири, Samura Shadow SH-0043", "Возврат-1","ii11407471334"],
    ["PlayStation 5 DualSense Gray Camouflage Беспроводной геймпад", "ii9447963153"]
  ];

  const classPrefix = "_element";

  // Проверяем, содержит ли текст все слова из какой-то группы
  function matchesAnyGroup(text) {
    return keywordGroups.some(group =>
      group.every(keyword => text.includes(keyword))
    );
  }

  function removeTargetDivs() {
    document.querySelectorAll(`div[class^="${classPrefix}"]`).forEach(div => {
      const text = div.textContent;
      if (matchesAnyGroup(text)) {
        div.remove();
        console.error("❌ Удалён элемент, содержащий все слова из одной из групп:", div); // Лог ошибки, если элемент удалён
      }
    });
  }

  // Наблюдение за изменениями в DOM
  const observer = new MutationObserver(() => {
    try {
      removeTargetDivs();
    } catch (err) {
      console.error("❌ Ошибка при удалении элементов из DOM:", err); // Лог ошибки при наблюдении за DOM
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Отслеживание изменений URL
  let lastUrl = location.href;
  setInterval(() => {
    try {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        removeTargetDivs();
      }
    } catch (err) {
      console.error("❌ Ошибка при отслеживании изменений URL:", err); // Лог ошибки при отслеживании URL
    }
  }, 1000);

  // Первоначальный запуск
  try {
    removeTargetDivs();
  } catch (err) {
    console.error("❌ Ошибка при первоначальном запуске:", err); // Лог ошибки при первоначальном запуске
  }
})();
