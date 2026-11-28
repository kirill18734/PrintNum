import AutoPrintRules from "@/components/autoPrintRules";
import PreviewPaper from "@/components/previewPaper";
import SettingsPaper from "@/components/settingsPaper";
import SettingsPrinter from "@/components/settingsPrinter";
import { StatusCard } from "@/components/statusCard";
import { useAppStore } from "@/services/store";
import { useState } from "react";
import type { PrinterPageProps } from "@/types/printer";

export default function AutoPrint({
  printer,
  listPrinters,
  setPrinter,
  paper,
  setPaper,
  listPapers,
  dataFonts,
  dataBackgrounds,
  backendOnline,
  printerOnline,
}: PrinterPageProps) {
  const excludedTexts = useAppStore((state) => state.excludedTexts);
  const idNum = useAppStore((state) => state.idNum);
  const endLine = useAppStore((state) => state.endLine);
  const font = useAppStore((state) => state.font);
  const expand = useAppStore((state) => state.expand);
  const opacity = useAppStore((state) => state.opacity);
  const bold = useAppStore((state) => state.bold);
  const showBarcode = useAppStore((state) => state.showBarcode);
  const printJobs = useAppStore((state) => state.printJobs);
  const background = useAppStore((state) => state.background);
  const [previewFont, setPreviewFont] = useState<string | undefined>();
  const [previewBackground, setPreviewBackground] = useState<
    string | undefined
  >();

  const handleFontChange = (value: string) => {
    setSetting("font", value);
    setPreviewFont(undefined);
  };

  const handleBackgroundChange = (value: string) => {
    setSetting("background", value);
    setPreviewBackground(undefined);
  };

  const setSetting = useAppStore((state) => state.setSetting);

  const setExcludedTexts = (rules: string[]) =>
    setSetting("excludedTexts", rules);

  const setIdNum = (value: boolean) => {
    if (value) setSetting("showBarcode", false);
    setSetting("idNum", value);
  };
  const setExpand = (value: string) => setSetting("expand", value);
  const setEndLine = (value: boolean) => setSetting("endLine", value);
  const setBold = (value: boolean) => setSetting("bold", value);
  const setShowBarcode = (value: boolean) => {
    if (value) setSetting("idNum", false);
    setSetting("showBarcode", value);
  };
  const setOpacity = (value: number) => setSetting("opacity", value);

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full">
      <StatusCard
        {...(printJobs.length ? printJobs[0] : { status: "waiting" })}
        printerOnline={printerOnline}
      />

      <SettingsPrinter
        printer={printer}
        listPrinters={listPrinters}
        setPrinter={setPrinter}
        paper={paper}
        setPaper={setPaper}
        listPapers={listPapers}
        backendOnline={backendOnline}
        printerOnline={printerOnline}
      />

      <AutoPrintRules rules={excludedTexts} onRulesChange={setExcludedTexts} />

      <div data-tauri-drag-region className="flex flex-col gap-1 size-full">
        <span className="font-semibold text-[10px] uppercase tracking-wider text-center text-muted-foreground">
          Оформление этикетки
        </span>

        <div
          data-tauri-drag-region
          className="flex items-center justify-between p-1.5 gap-2 rounded-lg bg-card"
        >
          <SettingsPaper
            idNum={idNum}
            setIdNum={setIdNum}
            endLine={endLine}
            setEndLine={setEndLine}
            bold={bold}
            font={font}
            background={background}
            dataBackgrounds={dataBackgrounds}
            dataFonts={dataFonts}
            setBold={setBold}
            showBarcode={showBarcode}
            setShowBarcode={setShowBarcode}
            expand={expand}
            setExpand={setExpand}
            opacity={opacity}
            setOpacity={setOpacity}
            onPreviewFont={setPreviewFont}
            onPreviewBackground={setPreviewBackground}
            onChangeFont={handleFontChange}
            onChangeBackground={handleBackgroundChange}
          />

          <PreviewPaper
            idNum={idNum}
            font={previewFont ?? font}
            endLine={endLine}
            expand={expand}
            bold={bold}
            showBarcode={showBarcode}
            mode="autoprint"
            background={previewBackground ?? background}
            opacity={opacity}
          />
        </div>
      </div>
    </div>
  );
}
