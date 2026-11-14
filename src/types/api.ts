import type { StatusCardProps } from "@/types/printJob";

/** Локальный фон, доступный через Tauri Asset Protocol. */
export interface BackgroundItem {
  id: string;
  name: string;
  src: string;
  size: number;
  modifiedAt: number;
}

/** Локальный файл шрифта, загружаемый WebView только при использовании. */
export interface FontItem {
  id: string;
  name: string;
  family?: string;
  weight?: number;
  fontStyle?: "normal" | "italic";
  format?: "truetype" | "opentype";
  src: string;
  size: number;
  modifiedAt: number;
}

/** Флаги изменений, возвращаемые endpoint changes. */
export interface DataChangesResponse {
  printersChanged: boolean;
  printerStatusChanged: boolean;
  backgroundsChanged: boolean;
  fontsChanged: boolean;
  printJobsChanged: boolean;
}

/** Данные, отправляемые на endpoint print-label. */
export interface PrintLabelRequest {
  contentType: import("@/types/label").LabelContentType;
  content: string;
  codeImage?: string;
  bold?: boolean;
  underline?: boolean;
  showCodeText?: boolean;
}

/** Ответ backend на отправку одного задания печати. */
export interface PrintLabelResponse {
  status: string;
}
