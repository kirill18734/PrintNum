import { useAppContext } from "@/AppContext";
import Paper from "@/components/paper";
import Printer from "@/components/printer";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { printer, listPrinters, paper, listPapers }: any = useAppContext();

  return (
    <div
      data-tauri-drag-region
      className=" flex-1 flex flex-col justify-between h-full gap-2"
    >
      <span data-tauri-drag-region className="text-center text-blue-600 mt-2">
        OZON
      </span>
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        {/* Принтер */}
        <Printer printer={printer} listPrinters={listPrinters} />
        {/* Бумага */}
        <Paper paper={paper} listPapers={listPapers} />
      </div>
      <Separator />
      
    </div>
  );
}
