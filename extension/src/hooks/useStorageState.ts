declare const chrome: any;

import { useEffect, useState } from "react";
import { get_local_storage, set_local_storage } from "@/shared/storage";
import type { StorageArrayKey } from "@/shared/types/storage";

export function useStorageState<Key extends StorageArrayKey>(
  key: Key,
  initialValue: string[],
) {
  const [state, setState] = useState<string[]>(initialValue);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  // 1. Загружаем данные из хранилища при старте или смене ключа
  useEffect(() => {
    let isActive = true;

    async function loadData() {
      const storedValue = await get_local_storage(key);
      if (!isActive) return;

      setState(storedValue !== false ? storedValue : initialValue);
      setLoadedKey(key);
    }

    void loadData();

    return () => {
      isActive = false;
    };
  }, [key]);

  // 2. Автоматически сохраняем изменения в chrome.storage при изменении state
  useEffect(() => {
    if (loadedKey !== key) return;

    void set_local_storage(key, state);
  }, [key, state, loadedKey]);

  // Переключатель элемента (только обновляет состояние React)
  const toggleItem = (item: string) => {
    setState((prev) => {
      return prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item];
    });
  };

  return [state, toggleItem, setState] as const;
}
