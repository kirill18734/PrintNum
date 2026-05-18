import { createThemeAction } from "remix-themes";
import { themeSessionResolver } from "@/.server/theme.sessions";

export const action = createThemeAction(themeSessionResolver);
