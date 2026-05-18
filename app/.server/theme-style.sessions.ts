import { createCookie } from "react-router";

export const themeStyleCookieStorage = createCookie("themeStyle", {
  maxAge: 604_800 /*one week*/,
});
