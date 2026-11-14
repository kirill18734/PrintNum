// Типизированный HTTP-клиент для запросов интерфейса к локальному backend.

import type {
  BackgroundItem,
  DataChangesResponse,
  FontItem,
  PrintLabelRequest,
  PrintLabelResponse,
} from "@/types/api";
import type { StatusCardProps } from "@/types/printJob";

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
  getChanges(): Promise<DataChangesResponse> {
    return apiClient<DataChangesResponse>("changes");
  },

  getPrinters(): Promise<string[]> {
    return apiClient<string[]>("printers");
  },

  getPrinterStatus(): Promise<boolean> {
    return apiClient<boolean>("printer-status");
  },

  getBackgrounds(): Promise<BackgroundItem[]> {
    return apiClient<BackgroundItem[]>("backgrounds");
  },

  getFonts(): Promise<FontItem[]> {
    return apiClient<FontItem[]>("fonts");
  },

  getPrintJobs(): Promise<StatusCardProps[]> {
    return apiClient<StatusCardProps[]>("print-jobs");
  },

  printLabel(data: PrintLabelRequest): Promise<PrintLabelResponse> {
    return apiClient<PrintLabelResponse>("print-label", data);
  },
};
