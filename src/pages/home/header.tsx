import IconApp from "@/assets/App";
import { Button } from "@/components/ui/button";
import { appService } from "@/services/app.tauri";
import { useAppStore } from "@/services/store";
import { IconMinus, IconX, IconSun, IconMoon } from "@tabler/icons-react";

export default function Header() {
  const theme = useAppStore((state: any) => state.theme);
  const updateStoreTauriValue = useAppStore(
    (state: any) => state.updateStoreTauriValue,
  );

  const toggleTheme = () => {
    updateStoreTauriValue("theme", theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      data-tauri-drag-region
      className="flex justify-between items-center h-(--header-height) border-0"
    >
      <div data-tauri-drag-region className="flex items-center border-0 h-full">
        <IconApp />
        <span data-tauri-drag-region>Печать ячеек</span>
      </div>

      <div className="flex items-center p-0 border-0">
        {/* Общепринятая интерактивная кнопка смены темы */}
        <Button
          variant="ghost"
          className="relative rounded-md p-6 border-0 mr-4 text-muted-foreground hover:text-foreground"
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
          className="rounded-none p-6 border-0"
          size="icon-sm"
          title="Свернуть"
          onClick={() => appService.minWindow()}
        >
          <IconMinus className="size-10" />
        </Button>
        <Button
          variant="ghost"
          className="rounded-none p-6 dark:hover:bg-red-600 hover:bg-red-600 hover:text-white border-0"
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
