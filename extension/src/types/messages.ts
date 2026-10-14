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
  return (
    typeof message === "object" &&
    message !== null &&
    "action" in message &&
    message.action === "sendNumberToFlask" &&
    "number" in message &&
    typeof message.number === "string"
  );
}

export function isSendPrintNumberResponse(
  response: unknown,
): response is SendPrintNumberResponse {
  if (typeof response !== "object" || response === null) {
    return false;
  }

  if (!("success" in response)) {
    return false;
  }

  return (
    response.success === true ||
    (response.success === false &&
      "error" in response &&
      typeof response.error === "string")
  );
}
