export const SELECTORS = {
  containerMenu: 'div[class^="_wrapperMenuItems_"]',
  containerNotification: "#ozi-notifications-container",
  titleReturns: 'div[class^="_breadcrumbsTitle_"]',
  containerReturns: 'div[class^="_block_"]:nth-of-type(2)',
  itemsReturns: 'div[class*="_itemsElement_"]',
  itemTitleReturns: 'div[class^="_titleWrap_"]',
  containerBannerAllOrder: 'div[class*="_bankBanner_"]',
  containerBannerOrder: 'div[class^="_bankWrapper_"]',
  packageM: 'div:nth-child(1) > [class^="ozi__input__root__"] button',
  packageL: 'div:nth-child(2) > [class^="ozi__input__root__"] button',
  scanOrder: 'div[class^="_scanAnimate_"]',
  numprint: 'div[class^="_list_"] div[class^="_shelfTag_"]',
};

export const TEXT = {
  CONTINUE: "Продолжить",
  ISSUE: "Выдать",
  PAY: "Провести оплату",
  PAY_REPEAT: "Попробовать ещё",
  HOME: "На главную",
  READY: "К выдаче",
  CHECK: "Проверить",
  ONCHECK: "На проверке",
  RETURN_REASON_1: "Изменил решение о покупке/Товар не подошёл",
};

export const workPathNames = {
  allOrder: "/orders",
  order: "/orders/session",
  recommendation: "/receiving-v2/main",
  package: "/outbound",
};
// QR-Codes
export const qrCommandsIssueAllOrder = [
  {
    id: "74892015376184239061527",
    name: "Выдать все (без пакета)",
    pathname: workPathNames.allOrder,
    actions: [TEXT.READY, TEXT.CONTINUE, TEXT.ISSUE, TEXT.HOME],
  },
  {
    id: "91347265019832476015342",
    name: "Выдать все (+1 пакет M)",
    pathname: workPathNames.allOrder,
    actions: [
      TEXT.READY,
      TEXT.CONTINUE,
      SELECTORS.packageM,
      TEXT.ISSUE,
      TEXT.HOME,
    ],
  },
  {
    id: "91347265019832476015343",
    name: "Выдать все (+1 пакет L)",
    pathname: workPathNames.allOrder,
    actions: [
      TEXT.READY,
      TEXT.CONTINUE,
      SELECTORS.packageL,
      TEXT.ISSUE,
      TEXT.HOME,
    ],
  },
];

export const qrCommandsIssueOrder = [
  {
    id: "37821563489167429583100",
    name: "Выдать заказ (без пакета)",
    pathname: workPathNames.order,
    actions: [TEXT.CONTINUE, TEXT.ISSUE, TEXT.HOME],
  },
  {
    id: "60418273951624830975261",
    name: "Выдать заказ (+1 пакет M)",
    pathname: workPathNames.order,
    actions: [TEXT.CONTINUE, SELECTORS.packageM, TEXT.ISSUE, TEXT.HOME],
  },
  {
    id: "60418273951624830975262",
    name: "Выдать заказ (+1 пакет L)",
    pathname: workPathNames.order,
    actions: [TEXT.CONTINUE, SELECTORS.packageL, TEXT.ISSUE, TEXT.HOME],
  },
];

export const qrCommandsPayOrder = [
  {
    id: "70983625147892016354712",
    name: "Оплатить заказ (без пакета)",
    pathname: workPathNames.order,
    actions: [TEXT.CONTINUE, TEXT.PAY, TEXT.HOME],
  },
  {
    id: "70983625147892016354713",
    name: "Оплатить заказ (+1 пакет M)",
    pathname: workPathNames.order,
    actions: [TEXT.CONTINUE, SELECTORS.packageM, TEXT.PAY, TEXT.HOME],
  },
  {
    id: "70983625147892016354714",
    name: "Оплатить заказ (+1 пакет L)",
    pathname: workPathNames.order,
    actions: [TEXT.CONTINUE, SELECTORS.packageL, TEXT.PAY, TEXT.HOME],
  },
];

export const qrCommandReturnOrder = [
  {
    id: "82634791520368417952631",
    name: "Отказ от товара",
    pathname: workPathNames.order,
    actions: [TEXT.CHECK, TEXT.ONCHECK, TEXT.READY, TEXT.RETURN_REASON_1],
  },
];

export const qrCommandRecommendation = [
  {
    id: "920374615208431975286391",
    pathname: workPathNames.recommendation,
    name: "С рекомендацией",
  },
];

// AutoScripts
export const autoScriptPackage = {
  name: "Упаковка не требуется",
  pathname: workPathNames.package,
};

export const hideBannerAllOrder = {
  name: "Баннер (Выдача заказов)",
  pathname: workPathNames.allOrder,
  action: SELECTORS.containerBannerAllOrder,
};

export const hideBannerOrder = {
  name: "Баннер (Открытая карточка выдачи)",
  pathname: workPathNames.order,
  action: SELECTORS.containerBannerOrder,
};
