import React from "react";
import { IconBrandGithub, IconBrandTelegram } from "@tabler/icons-react";
import { useAppStore } from "@/store/useAppStore"; // Укажите правильный путь к вашему стору

export const Footer: React.FC = () => {
  // Получаем нужные данные из стора напрямую
  const isUpdate = useAppStore((state: any) => state.isUpdate);
  const isUpdating = useAppStore((state: any) => state.isUpdating);
  const openHelp = useAppStore((state: any) => state.openHelp);
  const handleUpdateClick = useAppStore(
    (state: any) => state.handleUpdateClick,
  );
  const telegramLink =
    useAppStore((state: any) => state.telegramLink) || "https://t.me";

  return (
    <footer
      data-tauri-drag-region
      className="flex justify-between items-end h-[--footer-height] border-0 px-2 pb-2 relative"
    >
      {/* Левая часть — фиксированная ширина или изоляция потока */}
      <div className="flex justify-start items-center gap-3 w-full h-10">
        {/* КНОПКА 1: GitHub (Документация / Исходный код) */}
        <div className="relative w-10 h-10 shrink-0 z-10 hover:z-20">
          <button
            onClick={() => openHelp?.()}
            className="group absolute left-0 top-0 flex items-center h-10 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer w-10 hover:w-[270px] transition-all duration-300 overflow-hidden"
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
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute left-0 top-0 flex items-center h-10 px-2.5 text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 w-10 hover:w-[130px] transition-all duration-300 overflow-hidden"
          >
            {/* Иконка Telegram видна всегда */}
            <IconBrandTelegram size={20} className="shrink-0" />

            {/* Выдвигающийся контент */}
            <div className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[90px] group-hover:opacity-100 group-hover:ml-3 transition-all duration-300 ease-in-out whitespace-nowrap text-sm font-medium text-foreground">
              @printnum
            </div>
          </a>
        </div>
      </div>

      {/* Центральная часть: текст сверху, кнопка снизу — всегда строго по центру */}
      <div className="flex justify-center items-end w-full pointer-events-none">
        {isUpdate && (
          <div className="flex flex-col items-center gap-1 pointer-events-auto">
            <span className="text-xs font-medium text-muted-foreground">
              {isUpdating ? "Установка..." : "Доступно обновление"}
            </span>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateClick?.()}
              className="h-8 px-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isUpdating ? "Обновляется" : "Обновить"}
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};
