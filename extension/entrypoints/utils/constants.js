const API_BASE = "http://127.0.0.1:5000";

const SELECTOR = {
  menu: 'div[class^="_wrapperMenuItems_"]',
  notification: "#ozi-notifications-container",
  returnTitle: 'div[class^="_breadcrumbsTitle_"]',
  returns: 'div[class^="_block_"]:nth-of-type(2)',
  returnItem: 'div[class*="_itemsElement_"]',
  returnName: 'div[class^="_titleWrap_"]',
  bannerAll: 'div[class*="_bankBanner_"]',
  bannerOrder: 'div[class^="_bankWrapper_"]',
  packageM: 'div:nth-child(1) > [class^="ozi__input__root__"] button',
  packageL: 'div:nth-child(2) > [class^="ozi__input__root__"] button',
  printNumber: 'div[class^="_list_"] div[class^="_shelfTag_"]',
  boxes: 'input[type="checkbox"]',
};

const TEXT = {
  continue: "Продолжить",
  issue: "Выдать",
  pay: "Провести оплату",
  payAgain: "Попробовать ещё",
  confirm: "Подтвердить",
  ready: "К выдаче",
  check: "Проверить",
  checking: "На проверке",
  reason: "Изменил решение о покупке/Товар не подошёл",
  move: "Переместить",
};

const PATH = {
  all: "/orders",
  order: "/orders/session",
  recommendation: "/receiving-v2/main",
  package: "/outbound",
  shelf: "/outbound/selection",
};
const cmd = (id, code, name, path, actions, group, isLoop) => ({
  id,
  code,
  name,
  path,
  actions,
  group,
  isLoop,
});

// QR-Codes
const qrCodes = [
  // Группа: Выдача всех отправлений
  cmd(
    "all",
    "74892015376184239061527",
    "Выдать все (без пакета)",
    PATH.all,
    [TEXT.ready, TEXT.issue],
    "issue_all",
    true,
  ),
  cmd(
    "all_m",
    "91347265019832476015342",
    "Выдать все (+1 пакет M)",
    PATH.all,
    [TEXT.ready, SELECTOR.packageM, TEXT.issue],
    "issue_all",
    true,
  ),
  cmd(
    "all_l",
    "91347265019832476015343",
    "Выдать все (+1 пакет L)",
    PATH.all,
    [TEXT.ready, SELECTOR.packageL, TEXT.issue],
    "issue_all",
    true,
  ),

  // Группа: Выдача конкретного заказа
  cmd(
    "issue",
    "37821563489167429583100",
    "Выдать заказ (без пакета)",
    PATH.order,
    [TEXT.issue],
    "issue_order",
    false,
  ),
  cmd(
    "issue_m",
    "60418273951624830975261",
    "Выдать заказ (+1 пакет M)",
    PATH.order,
    [SELECTOR.packageM, TEXT.issue],
    "issue_order",
    false,
  ),
  cmd(
    "issue_l",
    "60418273951624830975262",
    "Выдать заказ (+1 пакет L)",
    PATH.order,
    [SELECTOR.packageL, TEXT.issue],
    "issue_order",
    false,
  ),

  // Группа: Оплата заказа
  cmd(
    "pay",
    "70983625147892016354712",
    "Оплатить заказ (без пакета)",
    PATH.order,
    [TEXT.pay],
    "pay_order",
    false,
  ),
  cmd(
    "pay_m",
    "70983625147892016354713",
    "Оплатить заказ (+1 пакет M)",
    PATH.order,
    [SELECTOR.packageM, TEXT.pay],
    "pay_order",
    false,
  ),
  cmd(
    "pay_l",
    "70983625147892016354714",
    "Оплатить заказ (+1 пакет L)",
    PATH.order,
    [SELECTOR.packageL, TEXT.pay],
    "pay_order",
    false,
  ),

  // Группа: Рекомендации
  cmd(
    "rec",
    "920374615208431975286391",
    "С рекомендацией",
    PATH.recommendation,
    [],
    "recommendation",
    false,
  ),

  cmd(
    "safe_package_xs",
    "504816293750184627395016",
    "Сейф-пакет XS",
    PATH.package,
    [],
    "package_radio",
    false,
  ),
  cmd(
    "safe_package_s",
    "504816293750184627395017",
    "Сейф-пакет S",
    PATH.package,
    [],
    "package_radio",
    false,
  ),
  cmd(
    "safe_package_m",
    "504816293750184627395018",
    "Сейф-пакет M",
    PATH.package,
    [],
    "package_radio",
    false,
  ),
  cmd(
    "safe_package_l",
    "504816293750184627395022",
    "Сейф-пакет L",
    PATH.package,
    [],
    "package_radio",
    false,
  ),
  cmd(
    "safe_package_xl",
    "504816293750184627395019",
    "Сейф-пакет XL",
    PATH.package,
    [],
    "package_radio",
    false,
  ),
  cmd(
    "ozon_packaging_unavailable",
    "504816293750184627395020",
    "Упаковки Ozon нет в наличии",
    PATH.package,
    [],
    "package_radio",
    false,
  ),
  cmd(
    "item_too_large",
    "504816293750184627395021",
    "Товар слишком большой",
    PATH.package,
    [],
    "package_radio",
    false,
  ),
  // =========================
  // Автоматическая выдача
  // Общий цикл:
  // без пакета → M → L → ...
  // =========================

  cmd(
    "auto_all",
    "82645173920468157392046",
    "Выдать все (авто)",
    PATH.all,
    [TEXT.ready, TEXT.issue],
    "package_cycle",
    true,
  ),

  cmd(
    "auto_issue",
    "56192837465019283746501",
    "Выдать заказ (авто)",
    PATH.order,
    [TEXT.issue],
    "package_cycle",
    false,
  ),

  cmd(
    "auto_pay",
    "39481726503948172650394",
    "Оплатить заказ (авто)",
    PATH.order,
    [TEXT.pay],
    "package_cycle",
    false,
  ),
];

const autoscripts = [
  { id: "package", name: "Упаковки Ozon нет в наличии", path: PATH.package },
  { id: "box", name: "Перенести тарники в перевозку", path: PATH.package },
];

const banners = [
  {
    name: "Баннер (Выдача заказов)",
    path: PATH.all,
    selector: SELECTOR.bannerAll,
  },
  {
    name: "Баннер (Открытая карточка выдачи)",
    path: PATH.order,
    selector: SELECTOR.bannerOrder,
  },
];
