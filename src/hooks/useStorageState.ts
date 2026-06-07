import { load } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";

const storePromise = load("config.json", {
  autoSave: true,
  defaults: {},
});

export function useStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const store = await storePromise;
      const value = await store.get<T>(key);

      if (value !== undefined) {
        setState(value);
      }

      setLoaded(true);
    })();
  }, [key]);

  useEffect(() => {
    if (!loaded) return;

    (async () => {
      const store = await storePromise;
      await store.set(key, state);
    })();
  }, [state, key, loaded]);

  return [state, setState] as const;
}
