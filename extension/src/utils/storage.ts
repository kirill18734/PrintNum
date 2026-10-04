// Асинхронное получение данных из хранилища
declare const chrome: any;

export async function get_local_storage(key: any) {
  // chrome.storage.local.get возвращает объект вида { [key]: value }
  const result = await chrome.storage.local.get(key);

  // Если ключ существует, возвращаем его значение, иначе false
  return result.hasOwnProperty(key) ? result[key] : false;
}

// Асинхронная запись данных в хранилище
export async function set_local_storage(name: any, cfg: any) {
  // chrome.storage автоматически преобразует объекты в строку, JSON.stringify не нужен
  await chrome.storage.local.set({ [name]: cfg });
}
