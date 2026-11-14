import type { StatusCardProps } from "@/types/printJob";

export interface BackgroundItem {
  id: string;
  name: string;
  base64: string;
}

/** Метаданные шрифта; бинарные данные загружаются отдельным запросом. */
export interface FontItem {
  id: string;
  name: string;
  family?: string;
  weight?: number;
  fontStyle?: "normal" | "italic";
  format?: "truetype" | "opentype";
  rel?: string;
  base64?: string;
}

export interface FontResourceResponse {
  id: string;
  base64: string;
}

export interface DataAppResponse {
  onlinePrinter: boolean;
  listPrinters: string[];
  dataBackgrounds: BackgroundItem[];
  dataFonts: FontItem[];
  printJobs: StatusCardProps[];
}

export interface PrintLabelRequest {
  contentType: import("@/types/label").LabelContentType;
  content: string;
  codeImage?: string;
  bold?: boolean;
  underline?: boolean;
  showCodeText?: boolean;
}

export interface PrintLabelResponse {
  status: string | boolean;
}
