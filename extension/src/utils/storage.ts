import type { ChromeApi } from "@/types/chrome-api";
import { isStorageValue } from "@/types/storage";
import type { StorageKey, StorageValue } from "@/types/storage";

declare const chrome: ChromeApi;

export async function get_local_storage<Key extends StorageKey>(
  key: Key,
): Promise<StorageValue<Key> | false> {
  const result = await chrome.storage.local.get(key);

  if (!Object.prototype.hasOwnProperty.call(result, key)) {
    return false;
  }

  const value = result[key];
  if (!isStorageValue(key, value)) {
    throw new Error(`Некорректное значение в хранилище для ключа "${key}"`);
  }

  return value;
}

export async function set_local_storage<Key extends StorageKey>(
  key: Key,
  value: StorageValue<Key>,
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}
