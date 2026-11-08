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
  background,
  setBackground,
  dataFonts,
  dataBackgrounds,
}: any) {
  const excludedTexts = useAppStore((state) => state.excludedTexts);
  const idNum = useAppStore((state) => state.idNum);
  const endLine = useAppStore((state) => state.endLine);
  const hybrid = useAppStore((state) => state.hybrid);
  const font = useAppStore((state) => state.font);
  const expand = useAppStore((state) => state.expand);
  const bold = useAppStore((state) => state.bold);

  const setSetting = useAppStore((state) => state.setSetting);

  const setExcludedTexts = (rules: string[]) =>
    setSetting("excludedTexts", rules);

  const setIdNum = (value: boolean) => setSetting("idNum", value);
  const setHybrid = (value: boolean) => setSetting("hybrid", value);
  const setExpand = (value: number) => setSetting("expand", value);
  const setEndLine = (value: boolean) => setSetting("endLine", value);
  const setBold = (value: boolean) => setSetting("bold", value);
  const setFont = (value: string) => setSetting("font", value);

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      <LatestTextCard status="printed" text="231-2" receivedAt={new Date()} />

      <SettingsPrinter
        printer={printer}
        listPrinters={listPrinters}
        setPrinter={setPrinter}
        paper={paper}
        setPaper={setPaper}
        listPapers={listPapers}
      />

      <AutoPrintRules rules={excludedTexts} onRulesChange={setExcludedTexts} />

      <div data-tauri-drag-region className="flex flex-col gap-1 size-full">
        <span className="font-semibold text-[10px] uppercase tracking-wider text-center text-muted-foreground">
          Оформление этикетки
        </span>

        <div
          data-tauri-drag-region
          className="flex items-center justify-between p-1.5 rounded-lg bg-card"
        >
          <SettingsPaper
            idNum={idNum}
            setIdNum={setIdNum}
            endLine={endLine}
            setEndLine={setEndLine}
            bold={bold}
            font={font}
            background={background}
            setBackground={setBackground}
            dataBackgrounds={dataBackgrounds}
            dataFonts={dataFonts}
            setFont={setFont}
            setBold={setBold}
            hybrid={hybrid}
            setHybrid={setHybrid}
            expand={expand}
            setExpand={setExpand}
          />

          <PreviewPaper
            idNum={idNum}
            font={font}
            endLine={endLine}
            hybrid={hybrid}
            expand={expand}
            bold={bold}
            mode="autoprint"
            background={background}
            dataBackgrounds={dataBackgrounds}
          />
        </div>
      </div>
    </div>
  );
}
