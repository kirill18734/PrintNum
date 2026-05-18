import { themeStyleCookieStorage } from "@/.server/theme-style.sessions";

export async function action({ request }) {
  const cookieHeader = request.headers.get("Cookie");

  const cookieThemeStyle = (await themeStyleCookieStorage.parse(cookieHeader))
    ?.themeStyle;

  const bodyParams = await request.formData();
  const themeStyle = bodyParams.get("themeStyle");

  if (cookieThemeStyle !== themeStyle) {
    return new Response(null, {
      headers: {
        "Set-Cookie": await themeStyleCookieStorage.serialize({
          themeStyle,
        }),
      },
    });
  }

  return null;
}
