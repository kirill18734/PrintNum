import type { StatusCardProps } from "@/types/printJob";

/** Единый снимок состояния, возвращаемый GET /printer-data. */
export interface PrinterDataResponse {
  listPrinters: string[];
  printerOnline: boolean;
  printQueue: StatusCardProps[];
  /** Полные имена файлов в каталогах AppData/backgrounds и AppData/fonts. */
  backgrounds: string[];
  fonts: string[];
}

/** Метаданные шрифта, загруженного для Preview. */
export interface FontItem {
  id: string;
  name: string;
  label: string;
  family: string;
  weight: number;
  fontStyle: "normal" | "italic";
  format: "truetype" | "opentype";
  base64: string;
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
