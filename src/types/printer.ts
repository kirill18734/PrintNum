import type { PaperFormat } from "@/config/defaultConfig";

/** Общие параметры страниц ручной и автоматической печати. */
export interface PrinterPageProps {
  printer: string;
  listPrinters: string[];
  setPrinter: (printer: string) => void;
  paper: string;
  setPaper: (paper: string) => void;
  listPapers: PaperFormat[];
  dataFonts: string[];
  dataBackgrounds: string[];
  backendOnline: boolean;
  printerOnline: boolean;
}
