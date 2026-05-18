import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";

import "@/styles/globals.css";

import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";

import { themeSessionResolver } from "@/.server/theme.sessions";
import { themeStyleCookieStorage } from "@/.server/theme-style.sessions";
import { DEFAULT_THEME_STYLE } from "@/config/theme-style";
import { Spinner } from "./components/ui/spinner";
import IconApp from "./assets/App";
import { useEffect, useState } from "react";
import { updater } from "./services/updater";
import { sendServer } from "./services/api";
import { getCurrentWindow } from "@tauri-apps/api/window";

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookieThemeStyle = (await themeStyleCookieStorage.parse(cookieHeader))
    ?.themeStyle;
  const { getTheme } = await themeSessionResolver(request);
  return {
    themeStyle: cookieThemeStyle || DEFAULT_THEME_STYLE,
    themeColor: getTheme(),
  };
}

// GOOGLE FONTS
export const links = () => [
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "",
  },
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  // Architects Daughter
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap",
  },

  // Cantarell
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Cantarell:ital,wght@0,400;0,700;1,400;1,700&display=swap",
  },

  // DM Sans
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap",
  },

  // Fira Code
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap",
  },

  // Fira Sans
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  },

  // Geist Mono
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist+Mono:ital,wght@0,100..900;1,100..900&display=swap",
  },

  // Geist
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&display=swap",
  },

  // Inter
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },

  // JetBrains Mono
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
  },

  // Merriweather
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap",
  },

  // Noto Serif Georgian
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Serif+Georgian:wght@100..900&display=swap",
  },

  // Orbitron
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap",
  },

  // Outfit
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
  },

  // Playfair Display
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap",
  },

  // Rajdhani
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap",
  },

  // Space Mono
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap",
  },

  // Ubuntu
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
  },

  // VT323
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=VT323&display=swap",
  },
];

export function App() {
  const { themeColor, themeStyle } = useLoaderData();
  const [theme] = useTheme();

  const [statusServer, setStatusServer] = useState(false);

  const stateSever = async () => {
    await sendServer
      .get()
      .then(async (responce) => {
        let json = await responce.json();
        if (json?.status !== statusServer) setStatusServer(json.status);
      })
      .catch(() => {
        if (statusServer) setStatusServer(false);
      });
  };

  useEffect(() => {
    const interval = setInterval(stateSever, 3000);
    return () => clearInterval(interval);
  }, [statusServer]);

  // при полной загрузки окна отображаем страницу
  useEffect(() => {
    getCurrentWindow().show();
  }, []);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      theme-style={themeStyle}
      className={theme ?? ""}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(themeColor)} />
        <Links />
      </head>
      <body className="bg-background overflow-visible overscroll-none font-sans antialiased min-h-screen flex flex-col">
        {statusServer ? <Outlet /> : <LoadApp />}

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function LoadApp() {
  useEffect(() => {
    updater();
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
      {/* Блок заголовка */}
      <div className="flex flex-col items-center gap-2">
        <IconApp classN="size-20" />
        {/* Рекомендуется задать размер и цвет иконке */}
        <h1 className="text-3xl font-bold tracking-tight ">Печать ячеек</h1>
      </div>

      {/* Блок статуса загрузки */}
      <div className="flex items-center gap-2.5 text-neutral-500 animate-pulse">
        <Spinner className="size-5 animate-spin" />
        <p className="text-sm font-medium">Приложение запускается...</p>
      </div>
    </div>
  );
}

export default function AppWithProviders() {
  const { themeColor } = useLoaderData();
  return (
    <ThemeProvider
      specifiedTheme={themeColor}
      themeAction="/action/set-theme"
      disableTransitionOnThemeChange={true}
    >
      <App />
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
