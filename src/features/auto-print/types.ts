// Описывает событие, когда автопечать пропускает этикетку по правилу.
export interface SkippedPrintEvent {
  id: string;
  rule: string;
  text: string;
  timestamp: number;
}
