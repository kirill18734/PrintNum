// Загружает настройки до первого отображения React-приложения.
import { initStoreService, storeService } from "@/services/store.tauri";
import { useAppStore } from "@/services/store";
export async function bootstrapApp(): Promise<void> {
  await initStoreService();
  useAppStore.setState(storeService.getAll());
}
