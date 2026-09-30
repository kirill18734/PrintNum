declare const chrome: any;

import { API_BASE, qrCodes } from "@/utils/constants";
import { get_local_storage, set_local_storage } from "@/utils/storage";

export default defineBackground({
  main() {
    // ==========================================
    // 1. СЛУШАТЕЛЬ ДЛЯ СЕТЕВЫХ ЗАПРОСОВ (Flask)
    // ==========================================
    chrome.runtime.onMessage.addListener(
      (message: any, sender: any, sendResponse: any) => {
        if (message.action === "sendNumberToFlask") {
          fetch(API_BASE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: message.number }),
          })
            .then((response) => {
              if (!response.ok) {
                sendResponse({
                  success: false,
                  error: `${response.status} ${response.statusText}`,
                });
              } else {
                sendResponse({ success: true });
              }
            })
            .catch((error) => {
              sendResponse({ success: false, error: error.message });
            });

          return true;
        }
      },
    );

    // ==========================================
    // 2. СИНХРОНИЗАЦИЯ ХРАНИЛИЩА (Только QR-коды)
    // ==========================================
    chrome.runtime.onInstalled.addListener(async () => {
      try {
        const namesQrCommands = qrCodes.map((item: any) => item.name);
        const isInitialized = await get_local_storage("isInitialized");

        // 1. ПЕРВЫЙ ЗАПУСК: Инициализируем хранилище
        if (!isInitialized) {
          await set_local_storage("isInitialized", true);
          await set_local_storage("qrCodes", namesQrCommands);
          await set_local_storage("offQrCodes", namesQrCommands); // По умолчанию выключены
          return;
        }

        // 2. НЕ ПЕРВЫЙ ЗАПУСК: Получаем текущее состояние
        const storageQrCodes = await get_local_storage("qrCodes");
        const storageOffQrCodes = await get_local_storage("offQrCodes");

        // Хелпер для основного списка QR-кодов
        const syncArray = (current: any, targetNames: any) => {
          const currentArr = Array.isArray(current) ? current : [];
          const targetSet = new Set(targetNames);
          const filtered = currentArr.filter((item) => targetSet.has(item));
          const filteredSet = new Set(filtered);
          for (const name of targetNames) {
            if (!filteredSet.has(name)) {
              filtered.push(name);
            }
          }
          return filtered;
        };

        // Хелпер для списка отключений (новые элементы выключаются по умолчанию)
        const syncOffArraySmart = (
          currentOff: any,
          targetNames: any,
          mainStorage: any,
          autoOff: boolean, // Сделали явным типом, так как передается true
        ) => {
          const currentOffArr = Array.isArray(currentOff) ? currentOff : [];
          const mainStorageArr = Array.isArray(mainStorage) ? mainStorage : [];
          const targetSet = new Set(targetNames);
          const mainStorageSet = new Set(mainStorageArr);

          const filtered = currentOffArr.filter((item) => targetSet.has(item));
          const filteredSet = new Set(filtered);

          if (autoOff) {
            for (const name of targetNames) {
              if (!mainStorageSet.has(name) && !filteredSet.has(name)) {
                filtered.push(name);
              }
            }
          }
          return filtered;
        };

        // Хелпер проверки изменений
        const isChanged = (arr1: any, arr2: any) => {
          if (!Array.isArray(arr1) || !Array.isArray(arr2)) return true;
          if (arr1.length !== arr2.length) return true;
          const set1 = new Set(arr1);
          return arr2.some((item) => !set1.has(item));
        };

        // Вычисляем новые массивы
        const nextQrCodes = syncArray(storageQrCodes, namesQrCommands);
        const nextOffQrCodes = syncOffArraySmart(
          storageOffQrCodes,
          namesQrCommands,
          storageQrCodes,
          true,
        );

        // Записываем в базу, только если есть изменения
        if (isChanged(storageQrCodes, nextQrCodes)) {
          await set_local_storage("qrCodes", nextQrCodes);
        }
        if (isChanged(storageOffQrCodes, nextOffQrCodes)) {
          await set_local_storage("offQrCodes", nextOffQrCodes);
        }
      } catch (err) {
        console.error("Ошибка при синхронизации QR-кодов:", err);
      }
    });
  },
});
