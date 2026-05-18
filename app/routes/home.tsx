import { sendServer } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemFooter } from "@/components/ui/item";
import { tempConfig } from "@/config/tempConfig";
import {
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
} from "@tabler/icons-react";

import { useFetcher, useLoaderData } from "react-router";

export async function loader() {
  return await sendServer
    .get("get-config/running")
    .then(async (response) => {
      let json = await response.json();
      return { isRunning: json.running };
    })
    .catch(() => {
      return {
        isRunning: tempConfig.running,
      };
    });
}

export default function Home() {
  const fetcher = useFetcher();
  const { isRunning } = useLoaderData();

  const IconRun = isRunning ? (
    <IconPlayerStopFilled />
  ) : (
    <IconPlayerPlayFilled />
  );
  const TextRun = isRunning ? "Остановить" : "Запустить";
  const TextDescriptionRun = isRunning
    ? "Приложение запущено"
    : "Приложение остановлено";
  const classRun = isRunning ? "bg-red-600" : "bg-green-600";

  const sendChange = (data) => {
    // Отправляем на сервер с указанием типа шифрования JSON
    fetcher.submit(data, {
      method: "POST",
      action: "/action/set-config",
      encType: "application/json", // Обязательный параметр!
    });
  };

  return (
    <Item data-tauri-drag-region className="flex justify-center items-center">
      <ItemActions>
        <Button
          className={`rounded-full w-35 h-35 text-lg text-white shadow-xl/30 ${classRun}`}
          onClick={() => sendChange({ running: !isRunning })}
        >
          {IconRun}
          {TextRun}
        </Button>
      </ItemActions>
      <ItemFooter className="flex justify-center items-center text-xs text-muted-foreground gap-1">
        {TextDescriptionRun}
        {isRunning && (
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
