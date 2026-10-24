// Компоновка настроек выбранного принтера и формата этикетки.
import Paper from "@/components/paper";
import Printer from "@/components/printer";

interface PrinterSettingsProps {
  printer: string;
  printers: string[];
  paper: string;
  papers: string[];
  onPrinterChange: (printer: string) => void;
  onPaperChange: (paper: string) => void;
  printerOnline?: boolean;
}

export default function PrinterSettings({
  printer,
  printers,
  paper,
  papers,
  onPrinterChange,
  onPaperChange,
  printerOnline,
}: PrinterSettingsProps) {
  return (
    <section
      aria-label="Параметры печати"
      className="w-full min-w-0"
    >
      <div className="grid grid-cols-2 items-end gap-2 max-[380px]:grid-cols-1">
        <Printer
          defaultPrinter={printer}
          defaultListPrinters={printers}
          setDefaultPrinter={onPrinterChange}
          online={printerOnline}
        />
        <Paper
          defaultPaper={paper}
          setDefaultPaper={onPaperChange}
          defaultListPapers={papers}
        />
      </div>
    </section>
  );
}
// Компоновка настроек выбранного принтера и формата этикетки.