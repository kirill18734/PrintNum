// Экран ожидания доступности backend при запуске приложения.
import IconApp from "@/assets/App";
import { Spinner } from "@/components/ui/spinner";
import Header from "@/pages/home/header";

export default function Loading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 select-none">
      <Header />
      <div
        data-tauri-drag-region
        className="min-h-0 flex-1 flex flex-col items-center justify-center gap-6 p-4 text-center"
      >
        {/* Блок заголовка */}
        <div
          data-tauri-drag-region
          className="flex flex-col items-center gap-2"
        >
          <IconApp classN="size-20" />
          {/* Рекомендуется задать размер и цвет иконке */}
          <h1 className="text-3xl font-bold tracking-tight ">Печать ячеек</h1>
        </div>

        {/* Блок статуса загрузки */}
        <div
          data-tauri-drag-region
          className="flex items-center gap-2.5 text-neutral-500 animate-pulse"
        >
          <Spinner className="size-5 animate-spin" />
          <p className="text-sm font-medium">Приложение запускается...</p>
        </div>
      </div>
    </div>
  );
}
// Экран ожидания доступности backend при запуске приложения.
