import type { ChromeApi } from "@/types/chrome-api";
import {
  isSendPrintNumberMessage,
  type SendPrintNumberResponse,
} from "@/types/messages";

import { qrCommands } from "@/features/qr-automation/commands";
import { API_BASE } from "@/utils/constants";
import { get_local_storage, set_local_storage } from "@/utils/storage";

declare const chrome: ChromeApi;

export default defineBackground({
  main() {
    // ==========================================
    // 1. СЛУШАТЕЛЬ ДЛЯ СЕТЕВЫХ ЗАПРОСОВ И ОТПРАВКА НА BACKEND (Flask)
    // ==========================================
    chrome.runtime.onMessage.addListener(
      (message, _sender, sendResponse) => {
        if (isSendPrintNumberMessage(message)) {
          fetch(`${API_BASE}/print-number`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: message.number }),
          })
            .then((response) => {
              let result: SendPrintNumberResponse;
              if (!response.ok) {
                result = {
                  success: false,
                  error: `${response.status} ${response.statusText}`,
                };
              } else {
                result = { success: true };
              }
              sendResponse(result);
            })
            .catch((error) => {
              sendResponse({
                success: false,
                error:
                  error instanceof Error ? error.message : String(error),
              });
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
        const namesQrCommands = qrCommands.map((item) => item.name);
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
        const syncArray = (
          current: string[] | false,
          targetNames: string[],
        ): string[] => {
          const currentArr = current || [];
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
          currentOff: string[] | false,
          targetNames: string[],
          mainStorage: string[] | false,
          autoOff: boolean,
        ): string[] => {
          const currentOffArr = currentOff || [];
          const mainStorageArr = mainStorage || [];
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
        const isChanged = (arr1: string[] | false, arr2: string[]) => {
          if (arr1 === false) return true;
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
