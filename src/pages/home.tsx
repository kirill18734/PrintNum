import { useAppContext } from "@/AppContext";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemFooter } from "@/components/ui/item";

import {
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
} from "@tabler/icons-react";

export default function Home() {
  const { running, setRunning } = useAppContext();

  const IconRun = running ? <IconPlayerStopFilled /> : <IconPlayerPlayFilled />;
  const TextRun = running ? "Остановить" : "Запустить";
  const TextDescriptionRun = running
    ? "Приложение запущено"
    : "Приложение остановлено";
  const classRun = running ? "bg-red-600" : "bg-green-600";

  return (
    <Item data-tauri-drag-region className="flex justify-center items-center">
      <ItemActions>
        <Button
          className={`rounded-full w-35 h-35 text-lg text-white shadow-xl/30 ${classRun}`}
        >
          {IconRun}
          {TextRun}
        </Button>
      </ItemActions>
      <ItemFooter className="flex justify-center items-center text-xs text-muted-foreground gap-1">
        {TextDescriptionRun}
        {running && (
          <>
            <span className="animate-pulse-1 text-xs text-muted-foreground">
              .
            </span>
            <span className="animate-pulse-2 text-xs text-muted-foreground">
              .
            </span>
            <span className="animate-pulse-3 text-xs text-muted-foreground">
              .
            </span>
          </>
        )}
      </ItemFooter>
    </Item>
  );
}
