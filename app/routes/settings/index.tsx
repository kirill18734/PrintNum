import { themeStyleCookieStorage } from "@/.server/theme-style.sessions";
import { sendServer } from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_THEME_STYLE } from "@/config/theme-style";
import { useFetcher, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Printer from "./printer";
import Paper from "./paper";
import ShowPaper from "./showPaper";
import Theme from "./theme";
import Style from "./style";
import { tempConfig } from "@/config/tempConfig";

export async function loader({ request }: any) {
  const cookieHeader = request.headers.get("Cookie");
  const cookieThemeStyle = (await themeStyleCookieStorage.parse(cookieHeader))
    ?.themeStyle;

  return await sendServer
    .get("get-config")
    .then(async (response) => {
      let json = await response.json();
      return {
        themeStyle: cookieThemeStyle || DEFAULT_THEME_STYLE,
        config: json,
      };
    })
    .catch(() => {
      return {
        themeStyle: cookieThemeStyle || DEFAULT_THEME_STYLE,
        config: tempConfig,
      };
    });
}

export default function Settings() {
  const fetcher = useFetcher();
  const { config, themeStyle } = useLoaderData();
  const [version, setVersion] = useState("");

  const sendChange = (data: any) => {
    fetcher.submit(data, {
      method: "POST",
      action: "/action/set-config",
      encType: "application/json",
    });
  };

  useEffect(() => {
    invoke("get_version").then(
      (message) => message && setVersion(`${message}`),
    );
  }, []);

  return (
    <div
      data-tauri-drag-region
      className=" flex-1 flex flex-col justify-between h-full gap-2"
    >
      <span data-tauri-drag-region className="text-center text-blue-600 mt-2">
        OZON
      </span>
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        {/* Принтер */}
        <Printer config={config} sendChange={sendChange} />
        {/* Бумага */}
        <Paper config={config} sendChange={sendChange} />
      </div>
      <Separator />

      <ShowPaper config={config} sendChange={sendChange} />

      <Separator />
      {/* тема/стиль */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        <Theme />
        <Style themeStyle={themeStyle} />
      </div>
      <div data-tauri-drag-region className="flex items-center justify-center">
        v{version}
      </div>
    </div>
  );
}
