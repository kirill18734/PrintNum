import { IconHelp, IconMinus, IconSettings, IconX } from "@tabler/icons-react";
import IconApp from "./assets/App";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import Home from "./pages/home";
import Loading from "./pages/loading";
import Settings from "./pages/settings";
import { useAppContext } from "./context/AppProvider";
import { useEffect, useState } from "react";
import { installAndRelaunch } from "./services/updater";

export default function Layout() {
  const {
    serverOnline,
    tab,
    setTab,
    printerOnline,
    closeWindow,
    hideWindow,
    openHelp,
    visibleWindow,
    isUpdate,
  }: any = useAppContext();

  useEffect(() => {
    visibleWindow();
  }, []);

  const [isUpdating, setIsUpdating] = useState(false); // Состояние процесса установки

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    try {
      await installAndRelaunch();
    } catch (error) {
      console.error("Ошибка при установке обновления:", error);
      setIsUpdating(false); // Возвращаем кнопку в рабочее состояние, если произошла ошибка
    }
  };

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
              <span data-tauri-drag-region>Печать ячеек</span>
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
              size="icon-sm"
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
                size="icon-sm"
                title="Свернуть"
                onClick={() => hideWindow()}
              >
                <IconMinus className="size-10" />
              </Button>
              <Button
                variant="ghost"
                className="rounded-none p-6 dark:hover:bg-red-600 hover:bg-red-600 hover:text-white border-0"
                size="icon-sm"
                title="Закрыть"
                onClick={() => closeWindow()}
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
            className="flex justify-between items-end h-(--footer-height) border-0 px-2 pb-2"
          >
            {/* Левая часть — выравнивание по нижнему краю */}
            <div className="flex justify-start items-end w-full">
              <Button variant="ghost" onClick={() => openHelp()}>
                <IconHelp /> Помощь
              </Button>
            </div>

            {/* Центральная часть: текст сверху, кнопка снизу — всегда строго по центру */}
            <div className=" flex justify-center items-end w-full">
              {isUpdate && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {isUpdating ? "Установка..." : "Доступно обновление"}
                  </span>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8"
                    disabled={isUpdating}
                    onClick={handleUpdateClick}
                  >
                    {isUpdating ? "Обновляется" : "Обновить"}
                  </Button>
                </div>
              )}
            </div>

            {/* Правая часть — выравнивание текста по нижнему краю, под высоту кнопок */}
            <div
              data-tauri-drag-region
              className="w-full flex justify-end text-right items-end h-8"
            >
              {!printerOnline && (
                <span
                  data-tauri-drag-region
                  className="text-red-700 font-medium leading-none"
                >
                  Принтер НЕДОСТУПЕН
                </span>
              )}
            </div>
          </footer>
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}
