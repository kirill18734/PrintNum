import type { PaperFormat } from "@/config/defaultConfig";
import type { BackgroundItem, FontItem } from "@/types/api";

/** Общие параметры страниц ручной и автоматической печати. */
export interface PrinterPageProps {
  printer: string;
  listPrinters: string[];
  setPrinter: (printer: string) => void;
  paper: string;
  setPaper: (paper: string) => void;
  listPapers: PaperFormat[];
  dataFonts: FontItem[];
  dataBackgrounds: BackgroundItem[];
  printerOnline: boolean;
}
