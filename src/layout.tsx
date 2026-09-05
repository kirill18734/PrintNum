import { IconMinus, IconSettings, IconX } from "@tabler/icons-react";
import IconApp from "./assets/App";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import Home from "./pages/home";
import Loading from "./pages/loading";
import Settings from "./pages/settings";
import { useAppContext } from "./context/AppProvider";
import { useEffect, useState } from "react";
import { installAndRelaunch } from "./services/updater";

// Заменили IconHelp на IconBrandGithub
import {
  IconBrandGithub,
  IconBrandTelegram,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";

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

  const [copied, setCopied] = useState(false);
  const channelName = "printnum";

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Изолируем клик, чтобы не срабатывали внешние события
    try {
      await navigator.clipboard.writeText(channelName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Возвращаем иконку копирования через 2 секунды
    } catch (err) {
      console.error("Не удалось скопировать:", err);
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
            className="flex justify-between items-end h-(--footer-height) border-0 px-2 pb-2 relative"
          >
            {/* Левая часть — фиксированная ширина или изоляция потока */}
            <div className="flex justify-start items-center gap-3 w-full h-10">
              {/* КНОПКА 1: GitHub (Документация / Исходный код) */}
              <div className="relative w-10 h-10 shrink-0 z-10 hover:z-20">
                <button
                  onClick={() => openHelp()}
                  className="group absolute left-0 top-0 flex items-center h-10 px-2.5 rounded-full bg-background border border-transparent text-muted-foreground hover:text-foreground hover:bg-accent hover:border-accent shadow-sm cursor-pointer w-10 hover:w-[270px] transition-all duration-300 overflow-hidden"
                >
                  {/* Иконка GitHub видна всегда */}
                  <IconBrandGithub size={20} className="shrink-0" />

                  {/* Выдвигающийся текст */}
                  <div className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[230px] group-hover:opacity-100 group-hover:ml-3 transition-all duration-300 ease-in-out whitespace-nowrap text-sm font-medium">
                    Документация / Исходный код
                  </div>
                </button>
              </div>

              {/* КНОПКА 2: Telegram канал */}
              <div className="relative w-10 h-10 shrink-0 z-10 hover:z-20">
                <div className="group absolute left-0 top-0 flex items-center h-10 px-2.5 rounded-full bg-background border border-transparent text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 hover:bg-muted hover:border-sky-500 shadow-sm w-10 hover:w-[160px] transition-all duration-300 overflow-hidden">
                  {/* Иконка Telegram видна всегда */}
                  <IconBrandTelegram size={20} className="shrink-0" />

                  {/* Выдвигающийся контент (Название + Кнопка копирования) */}
                  <div className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 group-hover:ml-3 transition-all duration-300 ease-in-out flex items-center whitespace-nowrap text-sm font-medium">
                    {/* Название канала */}
                    <span className="mr-2 text-foreground">{channelName}</span>

                    {/* Иконка копирования */}
                    <button
                      onClick={handleCopy}
                      className="p-1 rounded-ful bg-muted hover:bg-sky-100 dark:hover:bg-sky-950 text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-all active:scale-90 border border-input hover:border-sky-500"
                      title="Копировать"
                    >
                      {copied ? (
                        <IconCheck
                          size={14}
                          className="text-green-600 dark:text-green-500"
                        />
                      ) : (
                        <IconCopy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Центральная часть: текст сверху, кнопка снизу — всегда строго по центру */}
            <div className="flex justify-center items-end w-full pointer-events-none">
              {isUpdate && (
                <div className="flex flex-col items-center gap-1 pointer-events-auto">
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
