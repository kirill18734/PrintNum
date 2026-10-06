// Верхняя панель главного окна с названием приложения, темой и управлением окном.
import IconApp from "@/assets/App";
import { Button } from "@/components/ui/button";
import { appService } from "@/services/app.tauri";
import { useAppStore } from "@/services/store";
import { IconMinus, IconX, IconSun, IconMoon } from "@tabler/icons-react";

export default function Header() {
  const theme = useAppStore((state) => state.theme);
  const setSetting = useAppStore((state) => state.setSetting);

  const toggleTheme = () => {
    void setSetting("theme", theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      data-tauri-drag-region
      className="flex justify-between items-center h-(--header-height) border-0 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm"
    >
      {/* Левая часть: Иконка + Название + Брендинг */}
      <div
        data-tauri-drag-region
        className="flex items-center gap-2 border-0 h-full select-none"
      >
        <div
          data-tauri-drag-region
          className="flex items-center text-blue-600 dark:text-blue-400"
        >
          <IconApp />
        </div>
        <span
          data-tauri-drag-region
          className="font-medium text-sm text-neutral-700 dark:text-neutral-300"
        >
          Печать ячеек
        </span>
        <span
          data-tauri-drag-region
          className="text-neutral-300 dark:text-neutral-700 text-xs"
        >
          •
        </span>
        <span
          data-tauri-drag-region
          className="font-black tracking-wider text-blue-600 dark:text-blue-400 text-xs px-1.5 py-0.5 rounded bg-blue-500/10 dark:bg-blue-500/5"
        >
          OZON
        </span>
      </div>

      {/* Правая часть: Кнопки управления */}
      <div className="flex items-center p-0 border-0 h-full">
        {/* Общепринятая интерактивная кнопка смены темы */}
        <Button
          variant="ghost"
          className="relative rounded-md p-6 border-0 mr-2 text-muted-foreground hover:text-foreground"
          size="icon-sm"
          title="Сменить тему"
          onClick={toggleTheme}
        >
          {/* Солнце: уменьшается и поворачивается в темной теме */}
          <IconSun className="size-9 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500 fill-amber-500/10 stroke-[1.8]" />

          {/* Луна: абсолютно позиционирована, появляется и закручивается только в темной теме */}
          <IconMoon className="absolute size-9 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400 fill-sky-400/10 stroke-[1.8]" />

          <span className="sr-only">Переключить тему</span>
        </Button>

        <Button
          variant="ghost"
          className="rounded-none p-6 border-0 h-full flex items-center justify-center"
          size="icon-sm"
          title="Свернуть"
          onClick={() => appService.minWindow()}
        >
          <IconMinus className="size-10" />
        </Button>
        <Button
          variant="ghost"
          className="rounded-none p-6 dark:hover:bg-red-600 hover:bg-red-600 hover:text-white border-0 h-full flex items-center justify-center"
          size="icon-sm"
          title="Закрыть"
          onClick={() => appService.closeWindow()}
        >
          <IconX className="size-10" />
        </Button>
      </div>
    </header>
  );
}
// Верхняя панель главного окна с названием приложения, темой и управлением окном.
