// Типизированный HTTP-клиент для запросов интерфейса к локальному backend.

import type {
  DataAppResponse,
  PrintLabelRequest,
  PrintLabelResponse,
} from "@/types/api";

const API_BASE = "http://127.0.0.1:5000";

async function apiClient<TResponse>(
  endpoint: string,
  data?: unknown,
): Promise<TResponse> {
  const options: RequestInit = {
    method: data === undefined ? "GET" : "POST",
  };

  if (data !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, options);

    if (!response.ok) {
      let message = response.statusText;

      try {
        const errorData: unknown = await response.json();

        if (
          typeof errorData === "object" &&
          errorData !== null &&
          "message" in errorData &&
          typeof errorData.message === "string"
        ) {
          message = errorData.message;
        }
      } catch {
        // Если backend вернул ошибку не в формате JSON, используем statusText.
      }

      throw new Error(message || `Ошибка HTTP: ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } catch (error: unknown) {
    console.error(
      `[API Error] Запрос к ${endpoint} завершился неудачно:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}

export const backendClient = {
  dataApp(): Promise<DataAppResponse> {
    return apiClient<DataAppResponse>("data-app");
  },

  printLabel(data: PrintLabelRequest): Promise<PrintLabelResponse> {
    return apiClient<PrintLabelResponse>("print-label", data);
  },
};
