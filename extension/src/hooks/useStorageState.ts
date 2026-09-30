declare const chrome: any;

import { useState, useEffect } from "react";
import { get_local_storage } from "@/utils/storage";

export function useStorageState(key: string, initialValue: string[]) {
  const [state, setState] = useState<string[]>(initialValue);

  // 1. Загружаем данные из хранилища при старте или смене ключа
  useEffect(() => {
    async function loadData() {
      const storedValue = await get_local_storage(key);
      if (storedValue !== false) {
        setState(storedValue);
      }
    }
    loadData();
  }, [key]);

  // 2. Автоматически сохраняем изменения в chrome.storage при изменении state
  useEffect(() => {
    // Пропускаем запись дефолтного значения, если это необходимо,
    // либо пишем всегда, чтобы синхронизировать состояние
    set_local_storage(key, state);
  }, [key, state]);

  // Переключатель элемента (только обновляет состояние React)
  const toggleItem = (item: string) => {
    setState((prev) => {
      return prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item];
    });
  };

  return [state, toggleItem] as const;
}
