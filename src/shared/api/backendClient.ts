// Типизированный HTTP-клиент для запросов интерфейса к локальному backend.
import type { LabelContentType } from "@/components/LabelStudio";
import type { SkippedPrintEvent } from "@/features/auto-print/types";

const API_BASE = "http://127.0.0.1:5000";

interface PrintLabelRequest {
  contentType: LabelContentType;
  content: string;
  codeImage?: string;
  bold: boolean;
  underline: boolean;
  showCodeText: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function request(endpoint: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${API_BASE}/${endpoint}`, init);
  if (!response.ok) {
    let message = `Запрос к backend завершился ошибкой (${response.status})`;
    try {
      const body: unknown = await response.json();
      if (isRecord(body) && typeof body.error === "string") {
        message = body.error;
      }
    } catch {
      // Keep the HTTP status message when the error response has no JSON body.
    }
    throw new Error(message);
  }
  return response;
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export const backendClient = {
  async getPrinters(): Promise<string[]> {
    const body = await readJson<unknown>(
      await request("listPrinters"),
    );
    if (
      !isRecord(body) ||
      !Array.isArray(body.listPrinters) ||
      !body.listPrinters.every((printer) => typeof printer === "string")
    ) {
      throw new Error("Backend вернул некорректный список принтеров");
    }
    return body.listPrinters;
  },

  async getPrinterStatus(): Promise<boolean> {
    const body = await readJson<unknown>(
      await request("status-printer"),
    );
    if (!isRecord(body) || typeof body.printerOnline !== "boolean") {
      throw new Error("Backend вернул некорректный статус принтера");
    }
    return body.printerOnline;
  },

  async getLastSkippedPrint(): Promise<SkippedPrintEvent | null> {
    const body = await readJson<unknown>(
      await request("last-skipped"),
    );
    if (!isRecord(body)) {
      throw new Error("Backend вернул некорректный статус автопечати");
    }
    if (body.event === null) return null;

    const event = body.event;
    if (
      !isRecord(event) ||
      typeof event.id !== "string" ||
      typeof event.rule !== "string" ||
      typeof event.text !== "string" ||
      typeof event.timestamp !== "number"
    ) {
      throw new Error("Backend вернул некорректное событие пропущенной печати");
    }
    return {
      id: event.id,
      rule: event.rule,
      text: event.text,
      timestamp: event.timestamp,
    };
  },

  async printLabel(label: PrintLabelRequest): Promise<void> {
    await request("print-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(label),
    });
  },
};
