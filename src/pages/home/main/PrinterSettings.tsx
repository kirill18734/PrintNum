import Paper from "@/components/paper";
import Printer from "@/components/printer";

interface PrinterSettingsProps {
  printer: any;
  printers: any;
  paper: any;
  papers: any;
  onPrinterChange: (printer: any) => void;
  onPaperChange: (paper: any) => void;
}

export default function PrinterSettings({
  printer,
  printers,
  paper,
  papers,
  onPrinterChange,
  onPaperChange,
}: PrinterSettingsProps) {
  return (
    <section
      aria-label="Параметры печати"
      className="w-full rounded-xl border border-border bg-card p-2.5"
    >
      <div className="grid grid-cols-2 items-end gap-2.5">
        <Printer
          defaultPrinter={printer}
          defaultListPrinters={printers}
          setDefaultPrinter={onPrinterChange}
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