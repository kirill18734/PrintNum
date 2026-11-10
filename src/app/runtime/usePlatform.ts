import { useEffect } from "react";
import { appService } from "@/services/app.tauri";
import { useAppStore } from "@/services/store";

export function usePlatformRuntime(): void {
  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        await appService.initCloseHandler();

        await appService.initStartHandler();

        await appService.visibleWindow();

        const available = await appService.checkForUpdates();

        if (active) {
          useAppStore.getState().setIsUpdate(available);
        }
      } catch (error) {
        console.error(
          "Ошибка инициализации приложения:",
          error,
        );
      }
    };

    void initialize();

    return () => {
      active = false;
    };
  }, []);
}