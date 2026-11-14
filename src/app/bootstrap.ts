// Загружает настройки и локальные ресурсы до первого отображения React-приложения.
import { initStoreService, storeService } from "@/services/store.tauri";
import { useAppStore } from "@/services/store";
import { initializeResources } from "@/services/resources.tauri";

export async function bootstrapApp(): Promise<void> {
  await initStoreService();
  useAppStore.setState(storeService.getAll());

  // Ошибка чтения ресурсов не должна блокировать запуск интерфейса.
  try {
    await initializeResources();
  } catch (error) {
    console.error("Не удалось инициализировать локальные ресурсы:", error);
  }
}