import { IconHelp, IconMinus, IconSettings, IconX } from "@tabler/icons-react";
import { useAppContext } from "./AppContext";
import IconApp from "./assets/App";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import Home from "./pages/home";
import Loading from "./pages/loading";
import Settings from "./pages/settings";

export default function Layout() {
  const { serverOnline, tab, setTab, printerOnline }: any = useAppContext();

  return (
    <>
      {serverOnline ? (
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
              variant="ghost"
              className={cn(
                "rounded-none p-6 h-full border-0 transition-all",
                // При активности применяем переменные акцента текущей темы tweakcn
                tab
                  ? "bg-accent text-accent-foreground shadow-inner font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
              size="icon-lg"
              title="Настройки"
              onClick={() => setTab(!tab)}
            >
              <IconSettings
                className={cn(
                  "size-10 transition-transform duration-300",
                  tab && "rotate-45",
                )}
              />
            </Button>
            <div className="flex items-center p-0 border-0">
              <Button
                variant="ghost"
                className="rounded-none p-6 border-0"
                size="icon-lg"
                title="Свернуть"
              >
                <IconMinus className="size-10" />
              </Button>
              <Button
                variant="ghost"
                className="rounded-none p-6 dark:hover:bg-red-600 hover:bg-red-600 hover:text-white border-0"
                size="icon-lg"
                title="Закрыть"
              >
                <IconX className="size-10" />
              </Button>
            </div>
          </header>
          <main
            data-tauri-drag-region
            className="flex flex-col flex-1 justify-center"
          >
            {tab ? <Settings /> : <Home />}
          </main>
          <footer
            data-tauri-drag-region
            className="flex justify-between items-center h-(--header-height) border-0 px-2"
          >
            <Button variant="ghost">
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
      ) : (
        <Loading />
      )}
    </>
  );
}
