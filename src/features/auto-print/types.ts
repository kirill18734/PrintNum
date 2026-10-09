// Описывает этапы обработки и состояние последнего задания автопечати.
export type AutoPrintStepStatus =
  | "complete"
  | "pending"
  | "skipped"
  | "blocked"
  | "error";

export interface AutoPrintStep {
  status: AutoPrintStepStatus;
  message: string;
}

export type AutoPrintResultStatus =
  | "processing"
  | "printed"
  | "skipped"
  | "ignored"
  | "error";

export interface LatestAutoPrintStatus {
  id: number;
  text: string;
  receivedAt: number;
  status: AutoPrintResultStatus;
  steps: AutoPrintStep[];
}
