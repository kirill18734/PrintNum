import IconApp from "@/assets/App";
import { Button } from "@/components/ui/button";
import { appService } from "@/services/app.tauri";
import { IconMinus, IconX } from "@tabler/icons-react";

export default function Header() {
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
