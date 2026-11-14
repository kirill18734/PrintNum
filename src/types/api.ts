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
  /** Название для отображения и обратной совместимости с текущими настройками. */
  name: string;
  /** Семейство CSS. Если не передано, используется name. */
  family?: string;
  /** CSS font-weight конкретного файла начертания. */
  weight?: number;
  /** CSS font-style конкретного файла начертания. */
  fontStyle?: "normal" | "italic";
  /** Формат бинарного шрифта; текущий backend по умолчанию отдаёт TTF. */
  format?: "truetype" | "opentype";
  /** Старое поле оставлено необязательным для совместимости с backend. */
  rel?: string;
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
