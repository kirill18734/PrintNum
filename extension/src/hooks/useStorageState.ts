import { useState, useEffect } from "react";

export function useStorageState(key: string, initialValue: string[]) {
  const [state, setState] = useState<string[]>(initialValue);

  // Загружаем данные при старте popup
  useEffect(() => {
    browser.storage.local.get([key], (result: any) => {
      if (result[key]) {
        setState(result[key]);
      }
    });
  }, [key]);

  // Переключатель элемента
  const toggleItem = (item: string) => {
    setState((prev) => {
      const newValue = prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item];

      // Сохраняем в память расширения
      browser.storage.local.set({ [key]: newValue });

      return newValue;
    });
  };

  return [state, toggleItem] as const;
}
