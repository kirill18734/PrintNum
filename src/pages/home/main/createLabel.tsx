import SettingsPrinter from "@/components/settingsPrinter";

export default function CreateLabel({
  printer,
  listPrinters,
  setPrinter,
  paper,
  setPaper,
  listPapers,
}: any) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      <SettingsPrinter
        printer={printer}
        listPrinters={listPrinters}
        setPrinter={setPrinter}
        paper={paper}
        setPaper={setPaper}
        listPapers={listPapers}
      />
    </div>
  );
}
