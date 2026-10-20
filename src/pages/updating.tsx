// Экран ожидания установки обновления и перезапуска приложения.
import IconApp from "@/assets/App";

export default function Updating() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 select-none">
      <div
        data-tauri-drag-region
        className="min-h-0 flex-1 flex flex-col items-center justify-center gap-8 p-4 text-center"
      >
        {/* Блок заголовка */}
        <div
          data-tauri-drag-region
          className="flex flex-col items-center gap-2"
        >
          <IconApp classN="size-20" />
          <h1 className="text-3xl font-bold tracking-tight">
            Установка обновления
          </h1>
        </div>

        {/* Блок статуса и бесконечной анимации */}
        <div
          data-tauri-drag-region
          className="flex flex-col items-center gap-4 max-w-sm"
        >
          {/* Анимация прыгающих точек */}
          <div className="flex gap-1.5 items-center justify-center h-4">
            <div className="size-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.3s]" />
            <div className="size-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.15s]" />
            <div className="size-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" />
          </div>

          {/* Текст статуса */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              Пожалуйста, не закрывайте окно приложения.
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              После завершения установки приложение перезапустится
              автоматически.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// Экран ожидания установки обновления и перезапуска приложения.
