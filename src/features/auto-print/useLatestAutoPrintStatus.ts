// Получает статус последнего задания автопечати, пока открыт соответствующий режим.
import { useEffect, useState } from "react";
import { backendClient } from "@/shared/api/backendClient";
import type { LatestAutoPrintStatus } from "./types";

export function useLatestAutoPrintStatus(active: boolean) {
  const [latestStatus, setLatestStatus] =
    useState<LatestAutoPrintStatus | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let errorLogged = false;

    const poll = async () => {
      try {
        const status = await backendClient.getLatestAutoPrintStatus();
        if (cancelled) return;
        setLatestStatus(status);
        errorLogged = false;
      } catch (error) {
        if (!cancelled && !errorLogged) {
          console.error("Не удалось получить результат автопечати:", error);
          errorLogged = true;
        }
      } finally {
        if (!cancelled) timeout = setTimeout(poll, 1000);
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timeout !== undefined) clearTimeout(timeout);
    };
  }, [active]);

  return latestStatus;
}
