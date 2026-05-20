import IconApp from "@/assets/App";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sendServer } from "@/services/api";
import { IconHelp, IconMinus, IconSettings, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Command } from "@tauri-apps/plugin-shell";
import { open } from "@tauri-apps/plugin-shell";

export default function Layout() {
  const location = useLocation();
  const pathname = location.pathname;
  const isSettings = pathname.startsWith("/settings");
  const [printerOnline, setPrinterOnline] = useState(false);

  const statePrinter = async () => {
    await sendServer
      .get("status-printer")
      .then(async (response) => {
        let json = await response.json();

        if (json.printerOnline !== printerOnline)
          setPrinterOnline(json.printerOnline);
      })
      .catch(() => {
        if (printerOnline) setPrinterOnline(false);
      });
  };

  useEffect(() => {
    const interval = setInterval(statePrinter, 5000);
    return () => clearInterval(interval);
  }, [printerOnline]);

  return (
    <>
      <header
        data-tauri-drag-region
        className="flex justify-between items-center h-(--header-height) border-0"
      >
        <div
          data-tauri-drag-region
          className="flex items-center border-0 h-full"
        >
          <IconApp />
          <span data-tauri-drag-region className="text-lg">
            Печать ячеек
          </span>
        </div>
        <Button
          // variant="ghost" дает кнопке прозрачный фон по умолчанию
          variant="ghost"
          className={cn(
            "rounded-none p-6 h-full border-0 transition-all",
            // При активности применяем переменные акцента текущей темы tweakcn
            isSettings
              ? "bg-accent text-accent-foreground shadow-inner font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
          size="icon-lg"
          title="Настройки"
          asChild
        >
          <Link to={isSettings ? "/" : "/settings"}>
            <IconSettings
              className={cn(
                "size-10 transition-transform duration-300",
                isSettings && "rotate-45",
              )}
            />
          </Link>
        </Button>
        <div className="flex items-center p-0 border-0">
          <Button
            variant="ghost"
            className="rounded-none p-6 border-0"
            size="icon-lg"
            title="Свернуть"
            onClick={() => getCurrentWindow().minimize()}
          >
            <IconMinus className="size-10" />
          </Button>
          <Button
            variant="ghost"
            className="rounded-none p-6 dark:hover:bg-red-600 hover:bg-red-600 hover:text-white border-0"
            size="icon-lg"
            title="Закрыть"
            onClick={() => {
              // // ---------- Остановка backend ----------
              getCurrentWindow().onCloseRequested(() => {
                Command.create("stop_backend").execute();
              });
              getCurrentWindow().close();
            }}
          >
            <IconX className="size-10" />
          </Button>
        </div>
      </header>
      <main
        data-tauri-drag-region
        className="flex flex-col flex-1 justify-center"
      >
        <Outlet />
      </main>
      <footer
        data-tauri-drag-region
        className="flex justify-between items-center h-(--header-height) border-0 px-2"
      >
        <Button
          variant="ghost"
          onClick={() => open("https://github.com/kirill18734/PrintNum")}
        >
          <IconHelp />
          Помощь
        </Button>
        {!printerOnline && (
          <span data-tauri-drag-region className="text-red-700">
            Принтер НЕДОСТУПЕН
          </span>
        )}
      </footer>
    </>
  );
}
