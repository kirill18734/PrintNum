import { Store } from "@tauri-apps/plugin-store";

const store = await Store.load("settings.json");

export async function getValue(key: string) {
  return await store.get(key);
}

export async function setValue(key: string, value: any) {
  await store.set(key, value);
}

export async function resetConf() {
  await store.reset();
}
