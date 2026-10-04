import { useAppStore } from "@/services/store";
import StatusCard from "@/components/StatusCard";
import Paper from "@/components/paper";
import Printer from "@/components/printer";
import { Separator } from "@/components/ui/separator";
import ShowPaper from "@/components/showPaper";
import ThemeStyle from "@/components/theme-style";

export default function Main() {
  const running = useAppStore((state: any) => state.running);
  const printer = useAppStore((state: any) => state.printer);
  const paper = useAppStore((state: any) => state.paper);
  const idNum = useAppStore((state: any) => state.idNum);
  const endLine = useAppStore((state: any) => state.endLine);
  const hybrid = useAppStore((state: any) => state.hybrid);
  const expand = useAppStore((state: any) => state.expand);
  const themeStyle = useAppStore((state: any) => state.themeStyle);
  const listPrinters = useAppStore((state: any) => state.listPrinters);
  const listPapers = useAppStore((state: any) => state.listPapers);
  const printerOnline = useAppStore((state: any) => state.printerOnline);

  const updateStoreTauriValue = useAppStore(
    (state: any) => state.updateStoreTauriValue,
  );

  const changeRunning = () => updateStoreTauriValue("running", !running);
  const changePrinter = (newPrinter: any) =>
    updateStoreTauriValue("printer", newPrinter);
  const changePaper = (newPaper: any) =>
    updateStoreTauriValue("paper", newPaper);
  const changeIdNum = (newIdNum: string) =>
    updateStoreTauriValue("idNum", newIdNum);
  const changeEndLine = (newEndLine: string) =>
    updateStoreTauriValue("endLine", newEndLine);
  const changeHybrid = (newHybrid: string) =>
    updateStoreTauriValue("hybrid", newHybrid);
  const changeExpand = (newExpand: string) =>
    updateStoreTauriValue("expand", newExpand);
  const changeThemeStyle = (newThemeStyle: string) =>
    updateStoreTauriValue("themeStyle", newThemeStyle);

  return (
    <main className="flex flex-col gap-4 justify-between items-center p-4 min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      <span
        data-tauri-drag-region
        className="text-center font-bold tracking-wider text-blue-600 dark:text-blue-400 mt-2 select-none"
      >
        OZON
      </span>

      <StatusCard
        running={running}
        printerOnline={printerOnline}
        onToggleRunning={changeRunning}
      />

      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10 w-full max-w-sm"
      >
        <Printer
          defaultPrinter={printer}
          defaultListPrinters={listPrinters}
          setDefaultPrinter={changePrinter}
        />
        <Paper
          defaultPaper={paper}
          setDefaultPaper={changePaper}
          defaultListPapers={listPapers}
        />
      </div>

      <Separator className="max-w-sm opacity-60" />

      <div className="w-full max-w-sm">
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
      </div>

      <Separator className="max-w-sm opacity-60" />
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        <ThemeStyle
          defaultThemeStyle={themeStyle}
          setDefaultThemeStyle={changeThemeStyle}
        />
      </div>
    </main>
  );
}
