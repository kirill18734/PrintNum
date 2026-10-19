export const API_BASE = "http://127.0.0.1:5000";

export const SELECTOR = {
  packageM: 'div:nth-child(1) > [class^="ozi__input__root__"] button',
  packageL: 'div:nth-child(2) > [class^="ozi__input__root__"] button',
  printNumber: 'div[class^="_list_"] div[class^="_shelfTag_"]',
};

export const TEXT = {
  issue: "Выдать",
  pay: "Провести оплату",
  payAgain: "Попробовать ещё",
  ready: "К выдаче",
};

export const PATH = {
  all: "/orders",
  order: "/orders/session",
  recommendation: "/receiving-v2/main",
  package: "/outbound",
};
