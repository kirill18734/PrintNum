import type { StatusCardProps } from "@/types/printJob";

export interface BackgroundItem {
  id: string;
  name: string;
  base64: string;
}

/** Шрифт с метаданными и содержимым, загружаемый при изменении версии набора. */
export interface FontItem {
  id: string;
  name: string;
  family?: string;
  weight?: number;
  fontStyle?: "normal" | "italic";
  format?: "truetype" | "opentype";
  rel?: string;
  base64: string;
}

export interface DataAppResponse {
  fontsVersion: number;
  backgroundsVersion: number;
  printersVersion: number;
  onlinePrinter: boolean;
  printJobs: StatusCardProps[];
}

export interface FontsResponse {
  dataFonts: FontItem[];
}

export interface BackgroundsResponse {
  dataBackgrounds: BackgroundItem[];
}

export interface PrintersResponse {
  listPrinters: string[];
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
