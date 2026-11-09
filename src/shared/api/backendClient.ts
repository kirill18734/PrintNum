// Типизированный HTTP-клиент для запросов интерфейса к локальному backend.

import { LabelContentType } from "@/components/settingsCreatePaper";

const API_BASE = "http://127.0.0.1:5000";

async function apiClient(
  endpoint: string,
  data: any = null,
  customMethod = null,
) {
  const method = customMethod || (data ? "POST" : "GET");
  const options: any = { method };

  if (data) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, options);

    // Проверяем, успешный ли статус ответа (200-299)
    if (!response.ok) {
      let errorData;
      try {
        // Пробуем прочитать JSON с описанием ошибки от бэкенда
        errorData = await response.json();
      } catch {
        // Если бэкенд вернул ошибку не в формате JSON
        errorData = { message: response.statusText };
      }

      throw new Error(errorData.message || `Ошибка HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    // Сюда попадают и ошибки сети (сервер выключен), и ошибки из блока выше
    console.error(
      `[API Error] Запрос к ${endpoint} завершился неудачно:`,
      error.message,
    );
    throw error; // Пробрасываем ошибку дальше, чтобы её можно было поймать в компоненте
  }
}

interface PrintLabelRequest {
  contentType: LabelContentType;
  content: string;
  codeImage?: string;
  bold?: boolean;
  underline?: boolean;
  showCodeText?: boolean;
}

export const backendClient = {
  async dataApp(): Promise<any> {
    return await apiClient("data-app");
  },
  async printLabel(data: PrintLabelRequest): Promise<any> {
    console.log("Отправка задания на печать:", data);
    return await apiClient("print-label", data);
  },
};
