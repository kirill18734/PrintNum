export interface ManualPrintJob {
  startedAt: number;
  content: string;
  status: "processing" | "printed" | "error";
  message: string;
}
