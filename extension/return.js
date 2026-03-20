function tempautomation() {
  const label = [...document.querySelectorAll("label")].find((e) =>
    e.textContent.startsWith("Упаковка не требуется"),
  );

  if (!label) return;

  const checkbox = label.querySelector("input");

  if (!checkbox) return;

  if (!checkbox.checked) {
    console.log("запустил");
    label.click();
    return;
  } else {
    const input = document.querySelector(
      'input[placeholder="Отсканируйте или введите вручную"]',
    );
    if (!input) return;
    if (input.value.startsWith("ii") && input.value.length <= 13) {
      waitLoadElement("Завершить", "", false).then((btn) => btn.click());
    }
  }
}

const workUrlReturn1 = "https://turbo-pvz.ozon.ru/outbound";
new MutationObserver(() => {
  const currentUrlReturn = location.href;
  if (currentUrlReturn.startsWith(workUrlReturn1)) {
    tempautomation();
  }
}).observe(document.body, { subtree: true, childList: true });
