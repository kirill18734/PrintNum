import AutoPrintRules from "@/components/autoPrintRules";
import LatestTextCard from "@/components/latestTextCard";
import PreviewPaper from "@/components/previewPaper";
import SettingsPaper from "@/components/settingsPaper";
import SettingsPrinter from "@/components/settingsPrinter";
import { useAppStore } from "@/services/store";

export default function AutoPrint({
  printer,
  listPrinters,
  setPrinter,
  paper,
  setPaper,
  listPapers,
}) {
  const excludedTexts = useAppStore((state) => state.excludedTexts);
  const idNum = useAppStore((state) => state.idNum);
  const endLine = useAppStore((state) => state.endLine);
  const hybrid = useAppStore((state) => state.hybrid);
  const expand = useAppStore((state) => state.expand);
  const bold = useAppStore((state) => state.bold);

  const setSetting = useAppStore((state) => state.setSetting);
  const setExcludedTexts = (rules: string[]) =>
    setSetting("excludedTexts", rules);
  const setIdNum = (newIdNum: boolean) => setSetting("idNum", newIdNum);
  const setHybrid = (newHybrid: boolean) => setSetting("hybrid", newHybrid);
  const setExpand = (newExpand: number) => setSetting("expand", newExpand);
  const setEndLine = (newEndLine: boolean) => setSetting("endLine", newEndLine);
  const setBold = (newBold: boolean) => setSetting("bold", newBold);

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full">
      <SettingsPrinter
        printer={printer}
        listPrinters={listPrinters}
        setPrinter={setPrinter}
        paper={paper}
        setPaper={setPaper}
        listPapers={listPapers}
      />
      <LatestTextCard status="waiting" />
      <AutoPrintRules rules={excludedTexts} onRulesChange={setExcludedTexts} />
      <div data-tauri-drag-region className="flex flex-col gap-1 w-full">
        {/* Замените h-[180px] на нужную вам фиксированную высоту */}
        <span className="font-semibold text-[10px] uppercase tracking-wider text-center text-muted-foreground">
          Оформление этикетки
        </span>
        <div
          data-tauri-drag-region
          className="flex items-center justify-between border p-1.5 rounded-lg bg-card gap-2"
        >
          {/* Настройки */}
          <SettingsPaper
            idNum={idNum}
            setIdNum={setIdNum}
            endLine={endLine}
            setEndLine={setEndLine}
            bold={bold}
            setBold={setBold}
            hybrid={hybrid}
            setHybrid={setHybrid}
            expand={expand}
            setExpand={setExpand}
          />

          {/* Превью */}
          <PreviewPaper
            idNum={idNum}
            endLine={endLine}
            hybrid={hybrid}
            expand={expand}
            bold={bold}
            paper={paper}
          />
        </div>
      </div>
    </div>
  );
}
