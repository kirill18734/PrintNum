import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, createCookieSessionStorage, createCookie, UNSAFE_withComponentProps, useLoaderData, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Links, HashRouter, Outlet, ScrollRestoration, Scripts, useLocation, Link, useFetcher } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createThemeSessionResolver, ThemeProvider, useTheme, PreventFlashOnWrongTheme, Theme as Theme$1, createThemeAction } from "remix-themes";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2Icon, ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Command, open } from "@tauri-apps/plugin-shell";
import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { cva } from "class-variance-authority";
import { Slot, Separator as Separator$1, Select as Select$1, Checkbox as Checkbox$1, Label as Label$1 } from "radix-ui";
import { IconSettings, IconMinus, IconX, IconHelp, IconPlayerStopFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const themeSessionResolver = createThemeSessionResolver(
  createCookieSessionStorage({
    cookie: {
      name: "__remix-themes",
      // domain: 'remix.run',
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 604800,
      secrets: ["s3cr3t"]
      // secure: true,
    }
  })
);
const themeStyleCookieStorage = createCookie("themeStyle", {
  maxAge: 604800
});
const DEFAULT_THEME_STYLE = "vercel";
const THEMES_STYLE = [
  {
    name: "Claude",
    value: "claude"
  },
  {
    name: "Neobrutualism",
    value: "neobrutualism"
  },
  {
    name: "Supabase",
    value: "supabase"
  },
  {
    name: "Vercel",
    value: "vercel"
  },
  {
    name: "Mono",
    value: "mono"
  },
  {
    name: "Notebook",
    value: "notebook"
  },
  {
    name: "Light Green",
    value: "light-green"
  },
  {
    name: "Zen",
    value: "zen"
  },
  {
    name: "Astro Vista",
    value: "astro-vista"
  },
  {
    name: "WhatsApp",
    value: "whatsapp"
  },
  {
    name: "Terminal",
    value: "terminal"
  },
  {
    name: "Cyberpunk",
    value: "cyberpunk"
  },
  {
    name: "Astra",
    value: "astra"
  }
];
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Spinner({ className, ...props }) {
  return /* @__PURE__ */ jsx(Loader2Icon, { role: "status", "aria-label": "Loading", className: cn("size-4 animate-spin", className), ...props });
}
function IconApp({ classN = "" }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024",
      preserveAspectRatio: "xMidYMid meet",
      className: cn("size-10", classN),
      children: [
        "s",
        /* @__PURE__ */ jsxs(
          "g",
          {
            transform: "translate(0.000000,1024) scale(0.100000,-0.100000)",
            fill: "currentColor",
            stroke: "none",
            children: [
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M3274 9290 c-154 -49 -288 -181 -346 -341 -23 -64 -23 -68 -28 -684\r\nl-5 -620 -340 -1 c-331 -1 -343 -2 -436 -27 -313 -83 -539 -306 -631 -624\r\nl-23 -78 0 -1010 0 -1010 23 -78 c86 -297 318 -515 620 -583 57 -13 125 -18\r\n259 -18 l182 -1 -6 -25 c-3 -14 -13 -59 -23 -100 -25 -100 -277 -1174 -334\r\n-1420 -25 -107 -89 -379 -142 -605 -92 -385 -98 -416 -98 -515 0 -88 5 -117\r\n27 -179 69 -192 223 -339 427 -408 53 -17 158 -18 2670 -21 1898 -2 2637 0\r\n2695 8 304 43 539 312 538 615 0 65 -16 146 -81 420 -125 523 -251 1057 -392\r\n1655 -70 300 -130 551 -132 558 -2 11 22 13 117 13 264 -3 437 35 584 126 188\r\n117 308 283 364 502 22 86 22 90 22 1066 0 1088 3 1041 -67 1203 -115 265\r\n-350 457 -636 519 -63 14 -135 17 -409 18 l-333 0 0 600 c0 662 -1 673 -63\r\n788 -64 121 -172 212 -304 256 -62 21 -63 21 -1850 20 -1735 0 -1790 -1 -1849\r\n-19z m3626 -332 c71 -37 100 -82 111 -174 5 -44 8 -316 7 -607 l-3 -527 -1893\r\n-3 -1892 -2 0 588 c0 508 2 593 15 625 21 49 52 81 100 103 38 18 110 19 1775\r\n19 l1736 0 44 -22z m1170 -1666 c169 -61 290 -179 358 -349 l27 -68 3 -937 c3\r\n-1037 4 -1009 -61 -1132 -41 -78 -129 -166 -199 -200 -100 -49 -146 -56 -375\r\n-56 -196 0 -213 1 -213 18 0 9 -31 141 -68 294 l-68 276 77 4 c86 3 116 19\r\n157 79 23 33 23 38 20 239 -3 203 -3 206 -31 258 -38 72 -106 138 -175 170\r\nl-57 27 -2340 0 -2340 0 -67 -33 c-112 -55 -180 -149 -199 -277 -17 -105 -8\r\n-332 15 -377 26 -54 76 -81 161 -88 l71 -5 -63 -270 c-34 -148 -65 -280 -68\r\n-292 -5 -23 -6 -23 -213 -23 -152 0 -223 4 -265 15 -190 49 -337 214 -367 410\r\n-7 47 -10 370 -8 975 l3 905 22 65 c71 206 239 354 443 390 25 4 1330 7 2900\r\n6 l2855 -1 65 -23z m-978 -1912 c39 -164 425 -1811 519 -2215 55 -236 161\r\n-689 235 -1005 146 -617 145 -614 105 -705 -25 -57 -93 -124 -156 -155 l-50\r\n-25 -2605 -3 c-2972 -3 -2672 -12 -2775 91 -68 69 -95 127 -95 208 0 26 23\r\n144 51 261 28 117 147 625 264 1128 118 503 275 1174 349 1490 74 316 153 656\r\n176 755 22 99 45 197 51 218 l10 37 1951 -2 1952 -3 18 -75z"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M7595 6901 c-174 -80 -183 -325 -15 -411 117 -59 264 -11 319 105 54\r\n116 -2 260 -121 309 -50 21 -134 20 -183 -3z"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M4460 4859 c-167 -33 -301 -177 -335 -362 l-7 -37 145 0 144 0 7 42\r\nc10 60 66 114 129 123 163 25 208 -152 86 -332 -42 -62 -282 -306 -426 -435\r\nl-113 -100 0 -109 0 -109 454 0 453 0 6 118 c3 64 2 121 -2 125 -4 4 -121 6\r\n-259 5 -139 -2 -252 -2 -252 0 0 1 80 82 178 180 182 181 234 246 280 355 24\r\n55 27 75 27 177 0 105 -2 119 -27 165 -81 155 -281 235 -488 194z"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M5445 4856 c-163 -39 -287 -168 -302 -310 l-5 -51 38 2 c22 1 85 2\r\n140 2 l102 1 6 34 c4 21 20 46 40 64 97 85 256 12 256 -118 0 -93 -78 -157\r\n-205 -168 l-65 -5 0 -108 0 -109 53 0 c179 0 291 -120 230 -247 -59 -126 -288\r\n-117 -335 12 l-12 35 -139 0 -140 0 6 -45 c7 -68 60 -167 114 -214 95 -84 232\r\n-127 378 -117 150 9 253 53 335 143 95 104 116 272 49 403 -22 45 -93 112\r\n-143 138 l-40 19 37 18 c52 24 113 97 133 157 39 119 -6 282 -100 365 -110 97\r\n-280 136 -431 99z"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M3538 4723 l-177 -128 0 -127 -1 -127 146 95 c80 52 148 93 150 91 2\r\n-2 -14 -221 -36 -487 -22 -267 -40 -488 -40 -492 0 -4 67 -8 149 -8 l149 0 6\r\n83 c7 90 42 758 51 982 3 77 8 164 11 193 l5 52 -118 0 -118 0 -177 -127z"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M6516 4828 c-46 -73 -295 -525 -356 -647 l-72 -144 9 -131 8 -131\r\n278 -3 277 -2 0 -54 c0 -29 3 -81 6 -115 l7 -61 145 0 144 0 -5 33 c-3 17 -9\r\n70 -12 117 l-7 85 66 -3 c36 -2 66 -2 66 0 0 2 -7 58 -15 123 -8 66 -15 121\r\n-15 123 0 1 -28 2 -63 2 l-62 0 -23 303 c-13 166 -26 353 -29 415 l-6 112\r\n-163 0 c-159 0 -164 -1 -178 -22z m117 -596 c7 -112 10 -205 8 -208 -2 -2 -71\r\n-4 -152 -4 l-147 0 85 158 c47 86 108 202 136 257 l52 100 3 -50 c2 -27 9\r\n-141 15 -253z"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M3090 3058 c-50 -26 -90 -89 -90 -143 0 -47 40 -117 80 -140 35 -20\r\n46 -20 2045 -20 1999 0 2010 0 2045 20 51 30 83 96 76 160 -7 62 -29 93 -86\r\n123 l-44 22 -1991 0 -1991 0 -44 -22z"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M2974 2371 c-109 -49 -120 -211 -21 -285 l28 -21 2133 -3 2133 -2 34\r\n23 c105 70 108 206 6 281 l-28 21 -2122 2 c-2052 3 -2123 2 -2163 -16z"
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const updater = async () => {
  const update = await check();
  const startBackend = () => Command.create("start_backend").execute();
  if (!update) {
    startBackend();
    console.log("No update available");
  } else {
    console.log("Update available!", update.version, update.body);
    const yes = await ask(
      `Доступна новая версия ${update.version}!

Что нового:
${update.rawJson.note}`,
      {
        title: "Обновление PrintNum",
        kind: "info",
        okLabel: "Обновить",
        cancelLabel: "Позже"
      }
    );
    if (yes) {
      await update.downloadAndInstall();
      await relaunch();
    } else {
      startBackend();
    }
  }
};
const API_BASE = "http://127.0.0.1:5000";
const sendServer = {
  get: async (endpoint = "") => await fetch(`${API_BASE}/${endpoint}`),
  post: async (endpoint, body) => await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
};
async function loader$2({
  request
}) {
  const cookieHeader = request.headers.get("Cookie");
  const cookieThemeStyle = (await themeStyleCookieStorage.parse(cookieHeader))?.themeStyle;
  const {
    getTheme
  } = await themeSessionResolver(request);
  return {
    themeStyle: cookieThemeStyle || DEFAULT_THEME_STYLE,
    themeColor: getTheme()
  };
}
const links = () => [
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: ""
  },
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com"
  },
  // Architects Daughter
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap"
  },
  // Cantarell
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Cantarell:ital,wght@0,400;0,700;1,400;1,700&display=swap"
  },
  // DM Sans
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
  },
  // Fira Code
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap"
  },
  // Fira Sans
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
  },
  // Geist Mono
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist+Mono:ital,wght@0,100..900;1,100..900&display=swap"
  },
  // Geist
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&display=swap"
  },
  // Inter
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  },
  // JetBrains Mono
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
  },
  // Merriweather
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap"
  },
  // Noto Serif Georgian
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Serif+Georgian:wght@100..900&display=swap"
  },
  // Orbitron
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap"
  },
  // Outfit
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
  },
  // Playfair Display
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
  },
  // Rajdhani
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap"
  },
  // Space Mono
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
  },
  // Ubuntu
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
  },
  // VT323
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=VT323&display=swap"
  }
];
function App() {
  const {
    themeColor,
    themeStyle
  } = useLoaderData();
  const [theme] = useTheme();
  const [statusServer, setStatusServer] = useState(false);
  const stateSever = async () => {
    await sendServer.get().then(async (responce) => {
      let json = await responce.json();
      if (json?.status !== statusServer) setStatusServer(json.status);
    }).catch(() => {
      if (statusServer) setStatusServer(false);
    });
  };
  useEffect(() => {
    const interval = setInterval(stateSever, 1e3);
    return () => clearInterval(interval);
  }, [statusServer]);
  useEffect(() => {
    getCurrentWindow().show();
  }, []);
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    suppressHydrationWarning: true,
    "theme-style": themeStyle,
    className: theme ?? "",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(PreventFlashOnWrongTheme, {
        ssrTheme: Boolean(themeColor)
      }), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      className: "bg-background overflow-visible overscroll-none font-sans antialiased min-h-screen flex flex-col",
      children: [/* @__PURE__ */ jsx(HashRouter, {
        children: statusServer ? /* @__PURE__ */ jsx(Outlet, {}) : /* @__PURE__ */ jsx(LoadApp, {})
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
function LoadApp() {
  useEffect(() => {
    updater();
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    "data-tauri-drag-region": true,
    className: "flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center",
    children: [/* @__PURE__ */ jsxs("div", {
      "data-tauri-drag-region": true,
      className: "flex flex-col items-center gap-2",
      children: [/* @__PURE__ */ jsx(IconApp, {
        classN: "size-20"
      }), /* @__PURE__ */ jsx("h1", {
        className: "text-3xl font-bold tracking-tight ",
        children: "Печать ячеек"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      "data-tauri-drag-region": true,
      className: "flex items-center gap-2.5 text-neutral-500 animate-pulse",
      children: [/* @__PURE__ */ jsx(Spinner, {
        className: "size-5 animate-spin"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-sm font-medium",
        children: "Приложение запускается..."
      })]
    })]
  });
}
const root = UNSAFE_withComponentProps(function AppWithProviders() {
  const {
    themeColor
  } = useLoaderData();
  return /* @__PURE__ */ jsx(ThemeProvider, {
    specifiedTheme: themeColor,
    themeAction: "/action/set-theme",
    disableTransitionOnThemeChange: true,
    children: /* @__PURE__ */ jsx(App, {})
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  App,
  ErrorBoundary,
  LoadApp,
  default: root,
  links,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      "data-variant": variant,
      "data-size": size,
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
const layout = UNSAFE_withComponentProps(function Layout() {
  const location = useLocation();
  const pathname = location.pathname;
  const isSettings = pathname.startsWith("/settings");
  const [printerOnline, setPrinterOnline] = useState(false);
  const statePrinter = async () => {
    await sendServer.get("status-printer").then(async (response) => {
      let json = await response.json();
      if (json.printerOnline !== printerOnline) setPrinterOnline(json.printerOnline);
    }).catch(() => {
      if (printerOnline) setPrinterOnline(false);
    });
  };
  useEffect(() => {
    const interval = setInterval(statePrinter, 5e3);
    return () => clearInterval(interval);
  }, [printerOnline]);
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsxs("header", {
      "data-tauri-drag-region": true,
      className: "flex justify-between items-center h-(--header-height) border-0",
      children: [/* @__PURE__ */ jsxs("div", {
        "data-tauri-drag-region": true,
        className: "flex items-center border-0 h-full",
        children: [/* @__PURE__ */ jsx(IconApp, {}), /* @__PURE__ */ jsx("span", {
          "data-tauri-drag-region": true,
          className: "text-lg",
          children: "Печать ячеек"
        })]
      }), /* @__PURE__ */ jsx(Button, {
        variant: "ghost",
        className: cn(
          "rounded-none p-6 h-full border-0 transition-all",
          // При активности применяем переменные акцента текущей темы tweakcn
          isSettings ? "bg-accent text-accent-foreground shadow-inner font-medium" : "text-muted-foreground hover:text-foreground"
        ),
        size: "icon-lg",
        title: "Настройки",
        asChild: true,
        children: /* @__PURE__ */ jsx(Link, {
          to: isSettings ? "/" : "/settings",
          children: /* @__PURE__ */ jsx(IconSettings, {
            className: cn("size-10 transition-transform duration-300", isSettings && "rotate-45")
          })
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center p-0 border-0",
        children: [/* @__PURE__ */ jsx(Button, {
          variant: "ghost",
          className: "rounded-none p-6 border-0",
          size: "icon-lg",
          title: "Свернуть",
          onClick: () => getCurrentWindow().minimize(),
          children: /* @__PURE__ */ jsx(IconMinus, {
            className: "size-10"
          })
        }), /* @__PURE__ */ jsx(Button, {
          variant: "ghost",
          className: "rounded-none p-6 dark:hover:bg-red-600 hover:bg-red-600 hover:text-white border-0",
          size: "icon-lg",
          title: "Закрыть",
          onClick: () => {
            getCurrentWindow().onCloseRequested(() => {
              Command.create("stop_backend").execute();
            });
            getCurrentWindow().close();
          },
          children: /* @__PURE__ */ jsx(IconX, {
            className: "size-10"
          })
        })]
      })]
    }), /* @__PURE__ */ jsx("main", {
      "data-tauri-drag-region": true,
      className: "flex flex-col flex-1 justify-center",
      children: /* @__PURE__ */ jsx(Outlet, {})
    }), /* @__PURE__ */ jsxs("footer", {
      "data-tauri-drag-region": true,
      className: "flex justify-between items-center h-(--header-height) border-0 px-2",
      children: [/* @__PURE__ */ jsxs(Button, {
        variant: "ghost",
        onClick: () => open("https://github.com/kirill18734/PrintNum"),
        children: [/* @__PURE__ */ jsx(IconHelp, {}), "Помощь"]
      }), !printerOnline && /* @__PURE__ */ jsx("span", {
        "data-tauri-drag-region": true,
        className: "text-red-700",
        children: "Принтер НЕДОСТУПЕН"
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: layout
}, Symbol.toStringTag, { value: "Module" }));
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Separator$1.Root,
    {
      "data-slot": "separator",
      decorative,
      orientation,
      className: cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      ),
      ...props
    }
  );
}
const itemVariants = cva(
  "group/item flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-muted",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "border-transparent bg-muted/50"
      },
      size: {
        default: "gap-2.5 px-3 py-2.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "div";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "item",
      "data-variant": variant,
      "data-size": size,
      className: cn(itemVariants({ variant, size, className })),
      ...props
    }
  );
}
cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image: "size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function ItemActions({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "item-actions",
      className: cn("flex items-center gap-2", className),
      ...props
    }
  );
}
function ItemFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "item-footer",
      className: cn(
        "flex basis-full items-center justify-between gap-2",
        className
      ),
      ...props
    }
  );
}
const tempConfig = {
  printer: "",
  running: true,
  hybrid: true,
  listPrinters: ["asdfasdf"],
  listPapers: ["30*20"],
  idNum: false,
  endLine: false,
  paper: "30*20",
  expand: 500,
  printerOnline: false
};
async function loader$1() {
  return await sendServer.get("get-config/running").then(async (response) => {
    let json = await response.json();
    return {
      isRunning: json.running
    };
  }).catch(() => {
    return {
      isRunning: tempConfig.running
    };
  });
}
const home = UNSAFE_withComponentProps(function Home() {
  const fetcher = useFetcher();
  const {
    isRunning
  } = useLoaderData();
  const IconRun = isRunning ? /* @__PURE__ */ jsx(IconPlayerStopFilled, {}) : /* @__PURE__ */ jsx(IconPlayerPlayFilled, {});
  const TextRun = isRunning ? "Остановить" : "Запустить";
  const TextDescriptionRun = isRunning ? "Приложение запущено" : "Приложение остановлено";
  const classRun = isRunning ? "bg-red-600" : "bg-green-600";
  const sendChange = (data) => {
    fetcher.submit(data, {
      method: "POST",
      action: "/action/set-config",
      encType: "application/json"
      // Обязательный параметр!
    });
  };
  return /* @__PURE__ */ jsxs(Item, {
    "data-tauri-drag-region": true,
    className: "flex justify-center items-center",
    children: [/* @__PURE__ */ jsx(ItemActions, {
      children: /* @__PURE__ */ jsxs(Button, {
        className: `rounded-full w-35 h-35 text-lg text-white shadow-xl/30 ${classRun}`,
        onClick: () => sendChange({
          running: !isRunning
        }),
        children: [IconRun, TextRun]
      })
    }), /* @__PURE__ */ jsxs(ItemFooter, {
      className: "flex justify-center items-center text-xs text-muted-foreground gap-1",
      children: [TextDescriptionRun, isRunning && /* @__PURE__ */ jsxs(Fragment, {
        children: [/* @__PURE__ */ jsx("span", {
          className: "animate-pulse-1 text-xs text-muted-foreground",
          children: "."
        }), /* @__PURE__ */ jsx("span", {
          className: "animate-pulse-2 text-xs text-muted-foreground",
          children: "."
        }), /* @__PURE__ */ jsx("span", {
          className: "animate-pulse-3 text-xs text-muted-foreground",
          children: "."
        })]
      })]
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
function Select({
  ...props
}) {
  return /* @__PURE__ */ jsx(Select$1.Root, { "data-slot": "select", ...props });
}
function SelectGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Select$1.Group,
    {
      "data-slot": "select-group",
      className: cn("scroll-my-1 p-1", className),
      ...props
    }
  );
}
function SelectValue({
  ...props
}) {
  return /* @__PURE__ */ jsx(Select$1.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    Select$1.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(Select$1.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "pointer-events-none size-4 text-muted-foreground" }) })
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}) {
  return /* @__PURE__ */ jsx(Select$1.Portal, { children: /* @__PURE__ */ jsxs(
    Select$1.Content,
    {
      "data-slot": "select-content",
      "data-align-trigger": position === "item-aligned",
      className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
      position,
      align,
      ...props,
      children: [
        /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx(
          Select$1.Viewport,
          {
            "data-position": position,
            className: cn(
              "data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
              position === "popper" && ""
            ),
            children
          }
        ),
        /* @__PURE__ */ jsx(SelectScrollDownButton, {})
      ]
    }
  ) });
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    Select$1.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute right-2 flex size-4 items-center justify-center", children: /* @__PURE__ */ jsx(Select$1.ItemIndicator, { children: /* @__PURE__ */ jsx(CheckIcon, { className: "pointer-events-none" }) }) }),
        /* @__PURE__ */ jsx(Select$1.ItemText, { children })
      ]
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Select$1.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        ChevronUpIcon,
        {}
      )
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Select$1.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        ChevronDownIcon,
        {}
      )
    }
  );
}
function Printer({ config, sendChange }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsx("span", { children: "Принтер" }),
    /* @__PURE__ */ jsxs(
      Select,
      {
        defaultValue: config.printer,
        onValueChange: (e) => {
          sendChange({ printer: e });
        },
        children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full max-w-48", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Выберете принтер" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: /* @__PURE__ */ jsx(SelectGroup, { children: config.listPrinters.map((printer, i) => /* @__PURE__ */ jsx(SelectItem, { value: printer, children: printer }, i)) }) })
        ]
      }
    )
  ] });
}
function Paper({ config, sendChange }) {
  return /* @__PURE__ */ jsxs("div", { "data-tauri-drag-region": true, className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsx("span", { children: "Этикетка (mm)" }),
    /* @__PURE__ */ jsxs(
      Select,
      {
        defaultValue: config.paper,
        onValueChange: (e) => {
          sendChange({ paper: e });
        },
        children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full max-w-48", title: "Ширина*Высота", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Выберете этикетку" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: /* @__PURE__ */ jsx(SelectGroup, { children: config.listPapers.map((paper, i) => /* @__PURE__ */ jsx(SelectItem, { value: paper, children: paper }, i)) }) })
        ]
      }
    )
  ] });
}
function Preview({ config }) {
  return /* @__PURE__ */ jsxs("div", { "data-tauri-drag-region": true, className: "flex gap-4 w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 p-1", children: [
      config.hybrid && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "Этикетки 1 –",
        " ",
        config.expand - 1 < 1 ? config.expand : config.expand - 1
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex flex-col justify-center items-center\r\n          w-20 h-14 p-1 rounded-lg\r\n          border border-border\r\n          bg-white text-black shadow-sm font-[Arial]",
          children: [
            config.idNum && /* @__PURE__ */ jsx("div", { className: "flex justify-end items-center w-full text-right align-center  h-[0.5rem]", children: /* @__PURE__ */ jsx("span", { className: "text-[0.6rem]", children: "−47" }) }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center  leading-none flex-1 ", children: /* @__PURE__ */ jsxs(
              "span",
              {
                className: `text-4xl font-bold ${config.endLine && "underline  decoration-3"}`,
                children: [
                  "123",
                  !config.endLine && "."
                ]
              }
            ) })
          ]
        }
      )
    ] }),
    config.hybrid && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 p-1", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "Этикетки от ",
        config.expand
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex flex-col justify-around items-center\r\n            w-20 h-14 p-1 rounded-lg\r\n            border border-border\r\n            bg-white text-black shadow-sm font-[Arial]",
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex justify-start items-center w-full text-right align-center  h-[0.5rem]", children: /* @__PURE__ */ jsxs("span", { className: "text-[0.6rem]", children: [
              config.expand,
              "−"
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center  leading-none flex-1 ", children: /* @__PURE__ */ jsxs(
              "span",
              {
                className: `text-4xl font-bold ${config.endLine ? "underline  decoration-3" : ""}`,
                children: [
                  "123",
                  !config.endLine && "."
                ]
              }
            ) })
          ]
        }
      )
    ] })
  ] });
}
function Checkbox({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Checkbox$1.Root,
    {
      "data-slot": "checkbox",
      className: cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        Checkbox$1.Indicator,
        {
          "data-slot": "checkbox-indicator",
          className: "grid place-content-center text-current transition-none [&>svg]:size-3.5",
          children: /* @__PURE__ */ jsx(
            CheckIcon,
            {}
          )
        }
      )
    }
  );
}
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Label$1.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
const fieldVariants = cva(
  "group/field flex w-full gap-2 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal: "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive: "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
      }
    },
    defaultVariants: {
      orientation: "vertical"
    }
  }
);
function Field({
  className,
  orientation = "vertical",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "group",
      "data-slot": "field",
      "data-orientation": orientation,
      className: cn(fieldVariants({ orientation }), className),
      ...props
    }
  );
}
function FieldLabel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Label,
    {
      "data-slot": "field-label",
      className: cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      ),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      ),
      ...props
    }
  );
}
function Settings({ config, sendChange }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-tauri-drag-region": true,
      className: "flex flex-col items-end justify-end gap-2 w-full",
      children: /* @__PURE__ */ jsxs("div", { "data-tauri-drag-region": true, className: "flex flex-col items-start ", children: [
        /* @__PURE__ */ jsxs(Field, { orientation: "horizontal", className: "p-1 w-auto", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              id: "checkbox-idNum",
              checked: config.idNum,
              onCheckedChange: (e) => sendChange({ idNum: e })
            }
          ),
          /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "checkbox-idNum", children: "Показывать ID" })
        ] }),
        /* @__PURE__ */ jsxs(Field, { orientation: "horizontal", className: "p-1 w-auto", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              id: "checkbox-line",
              checked: config.endLine,
              onCheckedChange: (e) => sendChange({ endLine: e })
            }
          ),
          /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "checkbox-line", children: "Нижняя линия" })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            "data-tauri-drag-region": true,
            className: `flex flex-col items-center justify-center rounded-lg p-1  ${config.hybrid ? "border border-border bg-muted/30" : ""}`,
            children: [
              /* @__PURE__ */ jsxs(Field, { orientation: "horizontal", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    id: "checkbox-hybrid",
                    checked: config.hybrid,
                    onCheckedChange: (e) => sendChange({ hybrid: e })
                  }
                ),
                /* @__PURE__ */ jsx(FieldLabel, { htmlFor: "checkbox-hybrid", children: "Гибридный формат" })
              ] }),
              config.hybrid && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 pl-6", children: [
                /* @__PURE__ */ jsx(
                  "label",
                  {
                    htmlFor: "expand-value",
                    className: "text-xs text-muted-foreground",
                    children: "Начиная с номера"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "icon",
                      className: "h-8 w-8",
                      onClick: () => sendChange({ expand: Math.max(1, config.expand - 1) }),
                      children: "−"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "expand-value",
                      type: "number",
                      inputMode: "numeric",
                      min: 1,
                      value: config.expand,
                      onChange: (e) => {
                        const value = e.target.value;
                        if (value === "") {
                          sendChange({ expand: "" });
                        }
                        if (/^\d+$/.test(value)) {
                          sendChange({ expand: Number(value) });
                        }
                      },
                      onBlur: () => {
                        if (!Number.isInteger(Number(config.expand)) || Number(config.expand) < 1)
                          sendChange({ expand: 1 });
                      },
                      className: "\r\n      h-8 w-16 text-center\r\n      [appearance:textfield]\r\n      [&::-webkit-outer-spin-button]:appearance-none\r\n      [&::-webkit-inner-spin-button]:appearance-none\r\n    "
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "icon",
                      className: "h-8 w-8",
                      onClick: () => sendChange({ expand: config.expand + 1 }),
                      children: "+"
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      ] })
    }
  );
}
function showPaper({ config, sendChange }) {
  return /* @__PURE__ */ jsxs("div", { "data-tauri-drag-region": true, className: "flex flex-col items-center gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Оформление этикетки" }),
    /* @__PURE__ */ jsxs("div", { "data-tauri-drag-region": true, className: "flex items-start gap-7 w-full", children: [
      /* @__PURE__ */ jsx(Settings, { config, sendChange }),
      /* @__PURE__ */ jsx(Preview, { config })
    ] })
  ] });
}
function ThemeSelect() {
  const [theme, setTheme, { definedBy }] = useTheme();
  return /* @__PURE__ */ jsxs(
    Select,
    {
      defaultValue: definedBy === "SYSTEM" ? "system" : theme ?? "",
      onValueChange: (value) => {
        if (value === "system") {
          setTheme(null);
        } else {
          setTheme(value);
        }
      },
      children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Theme" }) }),
        /* @__PURE__ */ jsx(SelectContent, { children: /* @__PURE__ */ jsxs(SelectGroup, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: Theme$1.LIGHT, children: "Light" }),
          /* @__PURE__ */ jsx(SelectItem, { value: Theme$1.DARK, children: "Dark" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "system", children: "System" })
        ] }) })
      ]
    }
  );
}
function Theme() {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("span", { children: "Тема" }),
    /* @__PURE__ */ jsx(ThemeSelect, {})
  ] });
}
function ThemeStyle({ defaultThemeStyle }) {
  const fetcher = useFetcher();
  const sendChange = (e) => {
    fetcher.submit(
      { themeStyle: e },
      { method: "post", action: "/action/set-theme-style" }
    );
  };
  return /* @__PURE__ */ jsxs(Select, { defaultValue: defaultThemeStyle, onValueChange: sendChange, children: [
    /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full max-w-48", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Theme Style" }) }),
    /* @__PURE__ */ jsx(SelectContent, { children: /* @__PURE__ */ jsx(SelectGroup, { children: THEMES_STYLE.map((item) => /* @__PURE__ */ jsx(SelectItem, { value: item.value, children: item.name }, item.value)) }) })
  ] });
}
function Style({ themeStyle }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex  items-center gap-2", children: [
    /* @__PURE__ */ jsx("span", { children: "Стиль" }),
    /* @__PURE__ */ jsx(ThemeStyle, { defaultThemeStyle: themeStyle })
  ] });
}
async function loader({
  request
}) {
  const cookieHeader = request.headers.get("Cookie");
  const cookieThemeStyle = (await themeStyleCookieStorage.parse(cookieHeader))?.themeStyle;
  return await sendServer.get("get-config").then(async (response) => {
    let json = await response.json();
    return {
      themeStyle: cookieThemeStyle || DEFAULT_THEME_STYLE,
      config: json
    };
  }).catch(() => {
    return {
      themeStyle: cookieThemeStyle || DEFAULT_THEME_STYLE,
      config: tempConfig
    };
  });
}
const index = UNSAFE_withComponentProps(function Settings2() {
  const fetcher = useFetcher();
  const {
    config,
    themeStyle
  } = useLoaderData();
  const [version, setVersion] = useState("");
  const sendChange = (data) => {
    fetcher.submit(data, {
      method: "POST",
      action: "/action/set-config",
      encType: "application/json"
    });
  };
  useEffect(() => {
    invoke("get_version").then((message) => message && setVersion(`${message}`));
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    "data-tauri-drag-region": true,
    className: " flex-1 flex flex-col justify-between h-full gap-2",
    children: [/* @__PURE__ */ jsx("span", {
      "data-tauri-drag-region": true,
      className: "text-center text-blue-600 mt-2",
      children: "OZON"
    }), /* @__PURE__ */ jsxs("div", {
      "data-tauri-drag-region": true,
      className: "flex items-center justify-center gap-10",
      children: [/* @__PURE__ */ jsx(Printer, {
        config,
        sendChange
      }), /* @__PURE__ */ jsx(Paper, {
        config,
        sendChange
      })]
    }), /* @__PURE__ */ jsx(Separator, {}), /* @__PURE__ */ jsx(showPaper, {
      config,
      sendChange
    }), /* @__PURE__ */ jsx(Separator, {}), /* @__PURE__ */ jsxs("div", {
      "data-tauri-drag-region": true,
      className: "flex items-center justify-center gap-10",
      children: [/* @__PURE__ */ jsx(Theme, {}), /* @__PURE__ */ jsx(Style, {
        themeStyle
      })]
    }), /* @__PURE__ */ jsxs("div", {
      "data-tauri-drag-region": true,
      className: "flex items-center justify-center",
      children: ["v", version]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const action$2 = createThemeAction(themeSessionResolver);
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
async function action$1({
  request
}) {
  const cookieHeader = request.headers.get("Cookie");
  const cookieThemeStyle = (await themeStyleCookieStorage.parse(cookieHeader))?.themeStyle;
  const bodyParams = await request.formData();
  const themeStyle = bodyParams.get("themeStyle");
  if (cookieThemeStyle !== themeStyle) {
    return new Response(null, {
      headers: {
        "Set-Cookie": await themeStyleCookieStorage.serialize({
          themeStyle
        })
      }
    });
  }
  return null;
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1
}, Symbol.toStringTag, { value: "Module" }));
async function action({
  request
}) {
  const data = await request.json();
  await sendServer.post("set-config", data);
  return new Response(null);
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BqIbgAyk.js", "imports": ["/assets/chunk-4N6VE7H7-CenyOWzf.js", "/assets/index-CVFJD7-S.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-BdFpYVlG.js", "imports": ["/assets/chunk-4N6VE7H7-CenyOWzf.js", "/assets/index-CVFJD7-S.js", "/assets/createLucideIcon-BRMot8qi.js", "/assets/utils-DCADjnpI.js", "/assets/window-XZT-dURV.js", "/assets/core-Cn4yfEqx.js"], "css": ["/assets/root-BURSZRk0.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/layout": { "id": "routes/layout", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/layout-DmaVkyD_.js", "imports": ["/assets/chunk-4N6VE7H7-CenyOWzf.js", "/assets/window-XZT-dURV.js", "/assets/button-CZhrTiyZ.js", "/assets/utils-DCADjnpI.js", "/assets/createReactComponent-CJT_jvgH.js", "/assets/core-Cn4yfEqx.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "routes/layout", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-YM6S7Wwa.js", "imports": ["/assets/chunk-4N6VE7H7-CenyOWzf.js", "/assets/button-CZhrTiyZ.js", "/assets/utils-DCADjnpI.js", "/assets/createReactComponent-CJT_jvgH.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/settings/index": { "id": "routes/settings/index", "parentId": "routes/layout", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/index-D0vA6Kbj.js", "imports": ["/assets/chunk-4N6VE7H7-CenyOWzf.js", "/assets/utils-DCADjnpI.js", "/assets/index-CVFJD7-S.js", "/assets/button-CZhrTiyZ.js", "/assets/core-Cn4yfEqx.js", "/assets/createLucideIcon-BRMot8qi.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/action.set-theme": { "id": "routes/action.set-theme", "parentId": "root", "path": "action/set-theme", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/action.set-theme-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/action.set-theme-style": { "id": "routes/action.set-theme-style", "parentId": "root", "path": "action/set-theme-style", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/action.set-theme-style-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/action.set-config": { "id": "routes/action.set-config", "parentId": "root", "path": "action/set-config", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/action.set-config-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-4ef6b25b.js", "version": "4ef6b25b", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "v8_passThroughRequests": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = ["/", "/settings", "/action/set-theme", "/action/set-theme-style", "/action/set-config"];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/layout": {
    id: "routes/layout",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/home": {
    id: "routes/home",
    parentId: "routes/layout",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route2
  },
  "routes/settings/index": {
    id: "routes/settings/index",
    parentId: "routes/layout",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/action.set-theme": {
    id: "routes/action.set-theme",
    parentId: "root",
    path: "action/set-theme",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/action.set-theme-style": {
    id: "routes/action.set-theme-style",
    parentId: "root",
    path: "action/set-theme-style",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/action.set-config": {
    id: "routes/action.set-config",
    parentId: "root",
    path: "action/set-config",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
