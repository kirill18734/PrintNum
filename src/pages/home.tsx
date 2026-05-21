import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemFooter } from "@/components/ui/item";
import { useRunningContext } from "@/context/RunningProvider";

import {
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
} from "@tabler/icons-react";

export default function Home() {
  const { running, setRunning } = useRunningContext();

  const confRunning = running
    ? {
        icon: <IconPlayerStopFilled />,
        text: "Остановить",
        description: "Приложение запущено",
        classN: "bg-red-600",
      }
    : {
        icon: <IconPlayerPlayFilled />,
        text: "Запустить",
        description: "Приложение остановлено",
        classN: "bg-green-600",
      };

  return (
    <Item data-tauri-drag-region className="flex justify-center items-center">
      <ItemActions>
        <Button
          className={`rounded-full w-35 h-35 text-lg text-white shadow-xl/30 ${confRunning.classN}`}
          onClick={() => setRunning((e) => !e)}
        >
          {confRunning.icon}
          {confRunning.text}
        </Button>
      </ItemActions>
      <ItemFooter className="flex justify-center items-center text-xs text-muted-foreground gap-1">
        {confRunning.description}
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
