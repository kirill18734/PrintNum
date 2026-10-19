import type {
  SendPrintNumberMessage,
  SendPrintNumberResponse,
} from "./messages";

export interface ChromeApi {
  runtime: {
    sendMessage(message: SendPrintNumberMessage): Promise<unknown>;
    onMessage: {
      addListener(
        listener: (
          message: unknown,
          sender: unknown,
          sendResponse: (response: SendPrintNumberResponse) => void,
        ) => boolean | void,
      ): void;
    };
    onInstalled: {
      addListener(listener: () => void | Promise<void>): void;
    };
  };
  storage: {
    local: {
      get(key: string): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
    };
  };
}
