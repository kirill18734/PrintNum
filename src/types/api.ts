import type { StatusCardProps } from "@/types/printJob";

/** Фон, используемый редактором этикеток. */
export interface BackgroundItem {
  id: string;
  name: string;
  base64: string;
}

/** Шрифт, используемый редактором этикеток. */
export interface FontItem {
  id: string;
  /** Название для отображения и обратной совместимости с текущими настройками. */
  name: string;
  /** Семейство CSS. Если не передано, используется name. */
  family?: string;
  /** CSS font-weight конкретного файла начертания. */
  weight?: number;
  /** CSS font-style конкретного файла начертания. */
  fontStyle?: "normal" | "italic";
  /** Формат бинарного шрифта. */
  format?: "truetype" | "opentype";
  /** Старое поле оставлено необязательным для совместимости с текущими данными. */
  rel?: string;
  base64: string;
}

/** Единый снимок состояния, возвращаемый GET /printer-data. */
export interface PrinterDataResponse {
  listPrinters: string[];
  printerOnline: boolean;
  printQueue: StatusCardProps[];
}

/** Данные, отправляемые на POST /print-label. */
export interface PrintLabelRequest {
  contentType: import("@/types/label").LabelContentType;
  content: string;
  codeImage?: string;
  bold?: boolean;
  underline?: boolean;
  showCodeText?: boolean;
}

/** Ответ backend на POST /print-label. */
export interface PrintLabelResponse {
  status: boolean;
}
