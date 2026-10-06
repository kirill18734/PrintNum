import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/services/store";
import ThemeStyle from "@/components/theme-style";
import type { LabelContentType } from "@/components/LabelStudio";
import type { SkippedPrintEvent } from "@/components/AutoPrintRules";
import PreviewPaper from "@/components/previewPaper";
import { sendServer } from "@/services/api";
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
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [lastSkipped, setLastSkipped] = useState<SkippedPrintEvent | null>(null);
  const lastSkippedId = useRef<string | null>(null);
  const skipPollErrorLogged = useRef(false);
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
  const serverOnline = useAppStore((state: any) => state.serverOnline);
  const excludedTexts = useAppStore(
    (state: any) => state.excludedTexts as string[],
  );

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
  const changeExcludedTexts = (rules: string[]) =>
    updateStoreTauriValue("excludedTexts", rules);
  const updateLabelContent = (value: string) =>
    setContentByType((current) => ({ ...current, [contentType]: value }));

  const printLabel = async () => {
    const content = contentByType[contentType];
    if (!content.trim()) return;

    setIsPrinting(true);
    setPrintError(null);
    try {
      let codeImage: string | undefined;
      if (contentType !== "text") {
        const bwipjs = await import("bwip-js/browser");
        const canvas = document.createElement("canvas");
        const bcid =
          contentType === "barcode"
            ? "code128"
            : contentType === "qr"
              ? "qrcode"
              : "datamatrix";
        bwipjs.toCanvas(canvas, {
          bcid,
          text: content,
          scale: 3,
          padding: 0,
          backgroundcolor: "FFFFFF",
          barcolor: "000000",
        });
        codeImage = canvas.toDataURL("image/png").split(",")[1];
      }

      const response = await sendServer.post("print-label", {
        contentType,
        content,
        codeImage,
        bold: labelBold,
        underline: labelUnderline,
        showCodeText,
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || `Ошибка печати (${response.status})`);
      }
    } catch (error) {
      console.error("Не удалось напечатать этикетку:", error);
      setPrintError(
        error instanceof Error ? error.message : "Не удалось напечатать этикетку",
      );
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    if (mode !== "autoprint" || !serverOnline) return;

    let cancelled = false;
    const checkLastSkipped = async () => {
      try {
        const response = await sendServer.get("last-skipped");
        if (!response.ok) {
          throw new Error(`Skip status request failed: ${response.status}`);
        }

        const body: { event: SkippedPrintEvent | null } = await response.json();
        if (cancelled) return;

        const event = body.event;
        if (
          event &&
          typeof event.id === "string" &&
          typeof event.rule === "string" &&
          typeof event.text === "string" &&
          lastSkippedId.current !== event.id
        ) {
          lastSkippedId.current = event.id;
          setLastSkipped(event);
        }
        skipPollErrorLogged.current = false;
      } catch (error) {
        if (!skipPollErrorLogged.current) {
          console.error("Failed to retrieve skipped-print status:", error);
          skipPollErrorLogged.current = true;
        }
      }
    };

    checkLastSkipped();
    const interval = setInterval(checkLastSkipped, 1500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [mode, serverOnline]);

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
            onDismissSkipped={() => setLastSkipped(null)}
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
            onPrint={printLabel}
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
