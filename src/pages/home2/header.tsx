import IconApp from "@/assets/App";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppProvider2";
import { IconMinus, IconX } from "@tabler/icons-react";

export default function Header() {
  const { closeWindow, hideWindow }: any = useAppContext();

  return (
    <header
      data-tauri-drag-region
      className="flex justify-between items-center h-(--header-height) border-0"
    >
      <div data-tauri-drag-region className="flex items-center border-0 h-full">
        <IconApp />
        <span data-tauri-drag-region>Печать ячеек</span>
      </div>
      {/* <Button
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
      </Button> */}
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
  );
}
