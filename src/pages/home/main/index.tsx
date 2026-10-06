// Главный экран рабочих режимов: связывает настройки, панели функций и предпросмотр.
import { useState } from "react";
import { useAppStore } from "@/services/store";
import ThemeStyle from "@/components/theme-style";
import type { LabelContentType } from "@/components/LabelStudio";
import PreviewPaper from "@/components/previewPaper";
import { useSkippedPrintEvents } from "@/features/auto-print/useSkippedPrintEvents";
import { useLabelPrinting } from "@/features/label-creation/useLabelPrinting";
import AutoPrintPanel from "./AutoPrintPanel";
import CreateLabelPanel from "./CreateLabelPanel";
import ModeTabs from "./ModeTabs";
import PrinterSettings from "./PrinterSettings";

export default function Main() {
  const [mode, setMode] = useState<"autoprint" | "create">("autoprint");
  const [contentType, setContentType] = useState<LabelContentType>("text");
  const [contentByType, setContentByType] = useState<
    Record<LabelContentType, string>
  >({
    text: "",
    barcode: "",
    qr: "",
    datamatrix: "",
  });
  const [labelBold, setLabelBold] = useState(false);
  const [labelUnderline, setLabelUnderline] = useState(false);
  const [showCodeText, setShowCodeText] = useState(true);
  const running = useAppStore((state) => state.running);
  const printer = useAppStore((state) => state.printer);
  const paper = useAppStore((state) => state.paper);
  const idNum = useAppStore((state) => state.idNum);
  const endLine = useAppStore((state) => state.endLine);
  const hybrid = useAppStore((state) => state.hybrid);
  const expand = useAppStore((state) => state.expand);
  const themeStyle = useAppStore((state) => state.themeStyle);
  const listPrinters = useAppStore((state) => state.listPrinters);
  const listPapers = useAppStore((state) => state.listPapers);
  const printerOnline = useAppStore((state) => state.printerOnline);
  const serverOnline = useAppStore((state) => state.serverOnline);
  const excludedTexts = useAppStore((state) => state.excludedTexts);
  const setSetting = useAppStore((state) => state.setSetting);
  const { isPrinting, printError, printLabel } = useLabelPrinting();
  const { lastSkipped, dismissLastSkipped } = useSkippedPrintEvents(
    mode === "autoprint" && serverOnline,
  );

  const changeRunning = () => setSetting("running", !running);
  const changePrinter = (newPrinter: string) => setSetting("printer", newPrinter);
  const changePaper = (newPaper: string) => setSetting("paper", newPaper);
  const changeIdNum = (newIdNum: boolean) => setSetting("idNum", newIdNum);
  const changeEndLine = (newEndLine: boolean) => setSetting("endLine", newEndLine);
  const changeHybrid = (newHybrid: boolean) => setSetting("hybrid", newHybrid);
  const changeExpand = (newExpand: number | "") =>
    setSetting("expand", newExpand);
  const changeThemeStyle = (newThemeStyle: string) =>
    setSetting("themeStyle", newThemeStyle);
  const changeExcludedTexts = (rules: string[]) =>
    setSetting("excludedTexts", rules);
  const updateLabelContent = (value: string) =>
    setContentByType((current) => ({ ...current, [contentType]: value }));

  const submitLabel = () =>
    printLabel({
      contentType,
      content: contentByType[contentType],
      bold: labelBold,
      underline: labelUnderline,
      showCodeText,
    });

  const preview = (
    <PreviewPaper
      mode={mode}
      paper={paper}
      idNum={idNum}
      endLine={endLine}
      hybrid={hybrid}
      expand={expand}
      contentType={contentType}
      content={contentByType[contentType]}
      bold={labelBold}
      underline={labelUnderline}
      showCodeText={showCodeText}
    />
  );

  return (
    <main className="flex min-h-full w-full flex-col gap-2 bg-white p-2 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <ModeTabs mode={mode} onModeChange={setMode} />
      <PrinterSettings
        printer={printer}
        papers={listPapers}
        printers={listPrinters}
        paper={paper}
        onPrinterChange={changePrinter}
        onPaperChange={changePaper}
      />

      <div className="flex w-full flex-col gap-2">
        <div className="w-full min-w-0">
          <AutoPrintPanel
            active={mode === "autoprint"}
            running={running}
            printerOnline={printerOnline}
            onToggleRunning={changeRunning}
            rules={Array.isArray(excludedTexts) ? excludedTexts : []}
            onRulesChange={changeExcludedTexts}
            lastSkipped={lastSkipped}
            onDismissSkipped={dismissLastSkipped}
            idNum={idNum}
            onIdNumChange={changeIdNum}
            endLine={endLine}
            onEndLineChange={changeEndLine}
            hybrid={hybrid}
            onHybridChange={changeHybrid}
            expand={expand}
            onExpandChange={changeExpand}
            preview={preview}
          />
          <CreateLabelPanel
            active={mode === "create"}
            printerReady={printerOnline && Boolean(printer)}
            printerOnline={printerOnline}
            printerSelected={Boolean(printer)}
            isPrinting={isPrinting}
            printError={printError}
            onPrint={submitLabel}
            contentType={contentType}
            onContentTypeChange={setContentType}
            content={contentByType[contentType]}
            onContentChange={updateLabelContent}
            bold={labelBold}
            onBoldChange={setLabelBold}
            underline={labelUnderline}
            onUnderlineChange={setLabelUnderline}
            showCodeText={showCodeText}
            onShowCodeTextChange={setShowCodeText}
            preview={preview}
          />
        </div>
      </div>

      <div className="mt-auto flex w-full justify-end border-t border-border/70 pt-1.5">
        <ThemeStyle
          defaultThemeStyle={themeStyle}
          setDefaultThemeStyle={changeThemeStyle}
        />
      </div>
    </main>
  );
}
// Главный экран рабочих режимов: связывает настройки, панели функций и предпросмотр.
