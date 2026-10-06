// Получает события пропущенной автопечати, пока соответствующий экран активен.
import { useEffect, useRef, useState } from "react";
import { backendClient } from "@/shared/api/backendClient";
import type { SkippedPrintEvent } from "./types";

export function useSkippedPrintEvents(active: boolean) {
  const [lastSkipped, setLastSkipped] = useState<SkippedPrintEvent | null>(null);
  const lastSkippedId = useRef<string | null>(null);
  const errorLogged = useRef(false);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const event = await backendClient.getLastSkippedPrint();
        if (cancelled) return;

        if (event && lastSkippedId.current !== event.id) {
          lastSkippedId.current = event.id;
          setLastSkipped(event);
        }
        errorLogged.current = false;
      } catch (error) {
        if (!errorLogged.current) {
          console.error("Не удалось получить статус пропущенной печати:", error);
          errorLogged.current = true;
        }
      }
    };

    void poll();
    const interval = setInterval(poll, 1500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [active]);

  return { lastSkipped, dismissLastSkipped: () => setLastSkipped(null) };
}
