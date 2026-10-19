export interface SendPrintNumberMessage {
  action: "sendNumberToFlask";
  number: string;
}

export type SendPrintNumberResponse =
  | { success: true }
  | { success: false; error: string };

export function isSendPrintNumberMessage(
  message: unknown,
): message is SendPrintNumberMessage {
  if (typeof message !== "object" || message === null) return false;
  const m = message as Partial<Record<string, unknown>>;
  return m.action === "sendNumberToFlask" && typeof m.number === "string";
}

export function isSendPrintNumberResponse(
  response: unknown,
): response is SendPrintNumberResponse {
  if (typeof response !== "object" || response === null) return false;
  const r = response as Partial<Record<string, unknown>> & {
    success?: unknown;
  };
  if (typeof r.success !== "boolean") return false;
  return (
    r.success === true || (r.success === false && typeof r.error === "string")
  );
}

// Ozon Shelf
export interface SendShelfMessage {
  action: "sendShelfToFlask";
  text: string;
}

export function isSendShelfMessage(message: unknown): message is SendShelfMessage {
  if (typeof message !== "object" || message === null) return false;
  const m = message as Partial<Record<string, unknown>>;
  return m.action === "sendShelfToFlask" && typeof m.text === "string";
}
