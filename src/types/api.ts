import type { StatusCardProps } from "@/types/printJob";

/** Фон, загружаемый backend и используемый в редакторе этикеток. */
export interface BackgroundItem {
  id: string;
  name: string;
  base64: string;
}

/** Шрифт, загружаемый backend и используемый в редакторе этикеток. */
export interface FontItem {
  id: string;
  name: string;
  rel: string;
  base64: string;
}

/** Полный набор данных, возвращаемый endpoint data-app. */
export interface DataAppResponse {
  onlinePrinter: boolean;
  listPrinters: string[];
  dataBackgrounds: BackgroundItem[];
  dataFonts: FontItem[];
  printJobs: StatusCardProps[];
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
