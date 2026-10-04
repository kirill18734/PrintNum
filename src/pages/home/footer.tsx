import {
  IconBrandGithub,
  IconBrandTelegram,
  IconDownload,
} from "@tabler/icons-react";
import { useAppStore } from "@/services/store";
import { appService } from "@/services/app.tauri";

export default function Footer() {
  const isUpdate = useAppStore((state: any) => state.isUpdate);
  const isUpdating = useAppStore((state: any) => state.isUpdating);
  const version = useAppStore((state: any) => state.version);
  const setIsUpdating = useAppStore((state: any) => state.setIsUpdating);
  const setInstallUpdate = useAppStore(
    (state: any) => state.setInstallUpdate,
  );

  return (
    <footer
      data-tauri-drag-region
      // Убрали pb-3, элементы теперь центрируются идеально благодаря items-center
      className="grid grid-cols-3 items-center w-full h-(--header-height) px-4 bg-transparent select-none relative z-50"
    >
      {/* ЛЕВАЯ ЧАСТЬ: Версия приложения */}
      <div className="flex items-center justify-start h-9 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 z-20">
        v{version}
      </div>

      {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: Кнопка обновления по центру */}
      <div className="flex justify-center items-center h-9 z-10">
        {isUpdate && (
          <button
            disabled={isUpdating}
            onClick={async () => {
              try {
                // Переключаем приложение в режим установки обновления,
                // чтобы Layout отрисовал компонент <Updating />
                setInstallUpdate(true);
                setIsUpdating(true);
                await appService.installAndRelaunch();
              } finally {
                // На случай веб-мока без перезапуска вернём состояние
                setIsUpdating(false);
              }
            }}
            className="flex items-center gap-2 h-9 px-3 text-xs font-semibold rounded-xl bg-blue-500/10 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white disabled:opacity-60 transition-all duration-200 active:scale-[0.97] cursor-pointer shadow-sm"
          >
            <IconDownload
              size={14}
              className={isUpdating ? "animate-bounce" : ""}
            />
            <span>{isUpdating ? "Обновление..." : "Доступно обновление"}</span>
          </button>
        )}
      </div>

      {/* ПРАВАЯ ЧАСТЬ: Анимированные кнопки Bento */}
      <div className="flex items-center gap-2 h-9 z-20 justify-end">
        {/* КНОПКА 1: GitHub Документация */}
        <button
          onClick={() =>
            appService.openExternalUrl(
              "https://github.com/kirill18734/printnum",
            )
          }
          className="group inline-flex items-center justify-center h-9 px-3 rounded-xl text-[11px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 shadow-sm active:scale-[0.97] cursor-pointer"
        >
          <IconBrandGithub
            size={14}
            className="shrink-0 text-neutral-500 dark:text-neutral-400 transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110"
          />
          <span className="max-w-0 overflow-hidden transition-all duration-300 ease-out group-hover:max-w-[100px] group-focus-visible:max-w-[100px] group-hover:ml-1.5 group-focus-visible:ml-1.5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 whitespace-nowrap">
            Документация
          </span>
        </button>

        {/* КНОПКА 2: Telegram Канал */}
        <button
          onClick={() => appService.openExternalUrl("https://t.me/printnum")}
          className="group inline-flex items-center justify-center h-9 px-3 rounded-xl text-[11px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-sky-500/20 bg-gradient-to-b from-sky-500/5 to-sky-500/[0.12] text-sky-600 dark:text-sky-400 hover:from-sky-500 hover:to-sky-500 hover:text-white dark:hover:text-white shadow-sm shadow-sky-500/[0.03] active:scale-[0.97] cursor-pointer"
          title="Telegram-канал PrintNum"
        >
          <IconBrandTelegram
            size={14}
            className="shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 group-focus-visible:rotate-12 group-focus-visible:scale-110"
          />
          <span className="max-w-0 overflow-hidden transition-all duration-300 ease-out group-hover:max-w-[100px] group-focus-visible:max-w-[100px] group-hover:ml-1.5 group-focus-visible:ml-1.5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 whitespace-nowrap font-semibold">
            @printnum
          </span>
        </button>
      </div>
    </footer>
  );
}
