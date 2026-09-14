import { useAppStore } from "@/services/store";
import StatusCard from "@/components/StatusCard"; // Подключение созданного компонента
import Paper from "@/components/paper";
import Printer from "@/components/printer";
import { Separator } from "@/components/ui/separator";
import ShowPaper from "@/components/showPaper";

export default function Main() {
  const running = useAppStore((state: any) => state.running);
  const printer = useAppStore((state: any) => state.printer);
  const paper = useAppStore((state: any) => state.paper);
  const idNum = useAppStore((state: any) => state.idNum);
  const endLine = useAppStore((state: any) => state.endLine);
  const hybrid = useAppStore((state: any) => state.hybrid);
  const expand = useAppStore((state: any) => state.expand);
  const version = useAppStore((state: any) => state.version);
  const listPrinters = useAppStore((state: any) => state.listPrinters);
  const listPapers = useAppStore((state: any) => state.listPapers);
  const printerOnline = useAppStore((state: any) => state.printerOnline);

  const updateStoreTauriValue = useAppStore(
    (state: any) => state.updateStoreTauriValue,
  );

  // Функция для безопасного переключения состояния приложения
  const changeRunning = () => {
    updateStoreTauriValue("running", !running);
  };
  const changePrinter = (newPrinter: any) => {
    updateStoreTauriValue("printer", newPrinter);
  };

  const changePaper = (newPaper: any) => {
    updateStoreTauriValue("paper", newPaper);
  };
  const changeIdNum = (newIdNum: string) => {
    updateStoreTauriValue("idNum", newIdNum);
  };

  const changeEndLine = (newEndLine: string) => {
    updateStoreTauriValue("endLine", newEndLine);
  };

  const changeHybrid = (newHybrid: string) => {
    updateStoreTauriValue("hybrid", newHybrid);
  };

  const changeExpand = (newExpand: string) => {
    updateStoreTauriValue("expand", newExpand);
  };

  return (
    <main className="flex flex-col gap-1 justify-between items-center">
      <span data-tauri-drag-region className="text-center text-blue-600 mt-2">
        OZON
      </span>
      <StatusCard
        running={running}
        printerOnline={printerOnline}
        onToggleRunning={changeRunning}
      />
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        {/* Принтер */}
        <Printer
          defaultPrinter={printer}
          defaultListPrinters={listPrinters}
          setDefaultPrinter={changePrinter}
        />
        {/* Бумага */}
        <Paper
          defaultPaper={paper}
          setDefaultPaper={changePaper}
          defaultListPapers={listPapers}
        />
      </div>
      <Separator />
      <ShowPaper
        defaultIdNum={idNum}
        setDefaultIdNum={changeIdNum}
        defaultEndLine={endLine}
        setDefaultEndLine={changeEndLine}
        defaultHybrid={hybrid}
        setDefaultHybrid={changeHybrid}
        defaultExpand={expand}
        setDefaultExpand={changeExpand}
      />
      <Separator />
      <div
        data-tauri-drag-region
        className="flex items-center justify-center text-xs"
      >
        v{version}
      </div>
    </main>
  );
}
