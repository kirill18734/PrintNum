import type { StatusCardProps } from "@/types/printJob";

/** Фон, используемый редактором этикеток. */
export interface BackgroundItem {
  id: string;
  /** Имя файла без расширения — значение настройки backend. */
  name: string;
  base64: string;
}

/** Шрифт, используемый редактором этикеток. */
export interface FontItem {
  id: string;
  /** Имя файла без расширения — значение настройки backend. */
  name: string;
  /** Название, отображаемое в Select. */
  label?: string;
  /** CSS font-family, назначенное локальному файлу шрифта. */
  family?: string;
  /** CSS font-weight конкретного файла начертания. */
  weight?: number;
  /** CSS font-style конкретного файла начертания. */
  fontStyle?: "normal" | "italic";
  /** Формат бинарного шрифта. */
  format?: "truetype" | "opentype";
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