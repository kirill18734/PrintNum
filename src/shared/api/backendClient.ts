// Типизированный HTTP-клиент для запросов интерфейса к локальному backend.
import type { LabelContentType } from "@/components/LabelStudio";
import type {
  AutoPrintResultStatus,
  AutoPrintStep,
  AutoPrintStepStatus,
  LatestAutoPrintStatus,
} from "@/features/auto-print/types";

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

function isAutoPrintStatus(value: unknown): value is AutoPrintResultStatus {
  return (
    value === "processing" ||
    value === "printed" ||
    value === "skipped" ||
    value === "ignored" ||
    value === "error"
  );
}

function isAutoPrintStepStatus(value: unknown): value is AutoPrintStepStatus {
  return (
    value === "complete" ||
    value === "pending" ||
    value === "skipped" ||
    value === "blocked" ||
    value === "error"
  );
}

function parseLatestAutoPrintStatus(value: unknown): LatestAutoPrintStatus | null {
  if (!isRecord(value)) {
    throw new Error("Backend вернул некорректный статус автопечати");
  }
  if (value.event === null) return null;

  const event = value.event;
  if (
    !isRecord(event) ||
    typeof event.id !== "number" ||
    !Number.isFinite(event.id) ||
    typeof event.text !== "string" ||
    typeof event.receivedAt !== "number" ||
    !Number.isFinite(event.receivedAt) ||
    !isAutoPrintStatus(event.status) ||
    !Array.isArray(event.steps)
  ) {
    throw new Error("Backend вернул некорректный статус автопечати");
  }

  const steps: AutoPrintStep[] = event.steps.map((step) => {
    if (
      !isRecord(step) ||
      !isAutoPrintStepStatus(step.status) ||
      typeof step.message !== "string"
    ) {
      throw new Error("Backend вернул некорректный этап автопечати");
    }
    return { status: step.status, message: step.message };
  });

  return {
    id: event.id,
    text: event.text,
    receivedAt: event.receivedAt,
    status: event.status,
    steps,
  };
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

  async getLatestAutoPrintStatus(): Promise<LatestAutoPrintStatus | null> {
    return parseLatestAutoPrintStatus(
      await readJson<unknown>(await request("auto-print-status")),
    );
  },

  async printLabel(label: PrintLabelRequest): Promise<void> {
    await request("print-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(label),
    });
  },
};
