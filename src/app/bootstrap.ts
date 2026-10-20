// Загружает сохранённые настройки до первого отображения React-приложения.
import { initStoreService } from "@/services/store.tauri";
import { useAppStore } from "@/services/store";
import { storeService } from "@/services/store.tauri";

export async function bootstrapApp(): Promise<void> {
  await initStoreService();
  useAppStore.setState(storeService.getAll());
}
