import type { ChromeApi } from "@/shared/types/chrome-api";
import { isStorageValue } from "@/shared/types/storage";
import type { StorageKey, StorageValue } from "@/shared/types/storage";

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
    throw new Error(`Некорректное значение в хранилище для ключа "${String(key)}"`);
  }

  return value as StorageValue<Key>;
}

export async function set_local_storage<Key extends StorageKey>(
  key: Key,
  value: StorageValue<Key>,
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}
