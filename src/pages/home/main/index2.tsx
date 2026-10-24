// Главный экран рабочих режимов: связывает настройки, панели функций и предпросмотр.
import { useState } from "react";
import { useAppStore } from "@/services/store";
import ThemeStyle from "@/components/theme-style";
import type { LabelContentType } from "@/components/LabelStudio";
import PreviewPaper from "@/components/previewPaper";
import { useLabelPrinting } from "@/features/label-creation/useLabelPrinting";
import { useLatestAutoPrintStatus } from "@/features/auto-print/useLatestAutoPrintStatus";
import {
  getAutoPrintPreview,
  getRenamedText,
} from "@/features/auto-print/labelPreview";
import ShowPaper from "@/components/showPaper";
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
  const printer = useAppStore((state) => state.printer);
  const paper = useAppStore((state) => state.paper);
  const idNum = useAppStore((state) => state.idNum);
  const endLine = useAppStore((state) => state.endLine);
  const bold = useAppStore((state) => state.bold);
  const hybrid = useAppStore((state) => state.hybrid);
  const expand = useAppStore((state) => state.expand);
  const themeStyle = useAppStore((state) => state.themeStyle);
  const listPrinters = useAppStore((state) => state.listPrinters);
  const listPapers = useAppStore((state) => state.listPapers);
  const printerOnline = useAppStore((state) => state.printerOnline);
  const serverOnline = useAppStore((state) => state.serverOnline);
  const excludedTexts = useAppStore((state) => state.excludedTexts);
  const setSetting = useAppStore((state) => state.setSetting);
  const { isPrinting, manualJob, printLabel } = useLabelPrinting();
  const latestStatus = useLatestAutoPrintStatus(serverOnline);
  const autoPrintPreview = getAutoPrintPreview(latestStatus);
  const printerReady = printerOnline && Boolean(printer) && Boolean(paper);
  const readinessMessage = !printer
    ? "Выберите принтер"
    : !paper
      ? "Выберите этикетку"
      : !printerOnline
        ? "" // не дублируем текст, рядом с заголовком будет «НЕДОСТУПЕН»
        : "Принтер и этикетка готовы";
  const changePrinter = (newPrinter: string) =>
    setSetting("printer", newPrinter);
  const changePaper = (newPaper: string) => setSetting("paper", newPaper);
  const changeIdNum = (newIdNum: boolean) => setSetting("idNum", newIdNum);
  const changeEndLine = (newEndLine: boolean) =>
    setSetting("endLine", newEndLine);
  const changeBold = (newBold: boolean) => setSetting("bold", newBold);
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
    <>
      <PreviewPaper
        mode={mode}
        autoPrintText={autoPrintPreview.text}
        paper={paper}
        idNum={idNum}
        endLine={endLine}
        hybrid={hybrid}
        expand={expand}
        contentType={contentType}
        content={contentByType[contentType]}
        bold={mode === "autoprint" ? bold : labelBold}
        underline={labelUnderline}
        showCodeText={showCodeText}
      />
      {mode === "autoprint" && (
        <p className="mt-1 text-center text-[10px] text-muted-foreground">
          {autoPrintPreview.caption}
        </p>
      )}
    </>
  );

  // Показываем исходный текст из backend без переименования: важно видеть, что пришло (например, «ozon полка-1»)
  const lastShownText = latestStatus ? latestStatus.text || "" : "";
  const sepLast = lastShownText.indexOf("-");
  const lastMain =
    sepLast === -1 ? lastShownText : lastShownText.slice(0, sepLast);
  const lastRest = sepLast === -1 ? "" : lastShownText.slice(sepLast + 1);
  const renamedText = getRenamedText(latestStatus);

  return (
    <main className="flex min-h-0 w-full min-w-0 flex-col gap-2 overflow-y-auto overscroll-contain bg-white p-2 text-neutral-900 [scrollbar-gutter:stable_both-edges] dark:bg-neutral-950 dark:text-neutral-50">
      <AutoPrintPanel
        mode={mode}
        manualJob={manualJob}
        printerReady={printerReady}
        readinessMessage={readinessMessage}
        latestStatus={latestStatus}
        rules={Array.isArray(excludedTexts) ? excludedTexts : []}
        onRulesChange={changeExcludedTexts}
        printerSettings={
          <PrinterSettings
            printer={printer}
            papers={listPapers}
            printers={listPrinters}
            paper={paper}
            onPrinterChange={changePrinter}
            onPaperChange={changePaper}
            printerOnline={printerOnline}
          />
        }
        appearance={
          <>
            <ModeTabs mode={mode} onModeChange={setMode} />
            <div className="mt-2">
              {mode === "autoprint" ? (
                <div
                  id="mode-panel-autoprint"
                  role="tabpanel"
                  aria-labelledby="mode-tab-autoprint"
                  className="appearance-panel"
                >
                  <div className="mb-2" role="status" aria-live="polite">
                    {latestStatus ? (
                      <div className="flex w-full flex-col items-center gap-1">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <span
                            className="last-text-pill"
                            title={`Исходный: ${lastShownText || "Пустой текст"}`}
                          >
                            <span
                              className="last-text-icon"
                              aria-hidden="true"
                            ></span>
                            <span className="pill-text">
                              Последний: «{lastShownText || "Пустой текст"}»
                            </span>
                            <span className="last-text-time">
                              {new Date(
                                latestStatus.receivedAt,
                              ).toLocaleTimeString()}
                            </span>
                          </span>
                          {renamedText && (
                            <span
                              className="last-text-pill renamed-pill"
                              title={`Переименовано: ${renamedText}`}
                            >
                              <span className="pill-badge">Переименовано</span>
                              <span className="pill-text">«{renamedText}»</span>
                            </span>
                          )}
                        </div>
                        <div className="text-center text-[10px] text-muted-foreground">
                          <span>Начало: «{lastMain}»</span>
                          <span className="mx-1">•</span>
                          <span>Остальной: «{lastRest || "—"}»</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex w-full flex-col items-center">
                        <div
                          className="waiting-dots"
                          aria-label="Ожидание текста"
                        >
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <p className="mt-1 text-center text-xs text-muted-foreground">
                          Ожидается первое задание автопечати
                        </p>
                      </div>
                    )}
                  </div>
                  <ShowPaper
                    defaultIdNum={idNum}
                    setDefaultIdNum={changeIdNum}
                    defaultEndLine={endLine}
                    setDefaultEndLine={changeEndLine}
                    defaultBold={bold}
                    setDefaultBold={changeBold}
                    defaultHybrid={hybrid}
                    setDefaultHybrid={changeHybrid}
                    defaultExpand={expand}
                    setDefaultExpand={changeExpand}
                    preview={preview}
                    singleColumn
                  />
                </div>
              ) : (
                <CreateLabelPanel
                  active
                  printerReady={printerReady}
                  printerOnline={printerOnline}
                  printerSelected={Boolean(printer)}
                  isPrinting={isPrinting}
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
              )}
            </div>
          </>
        }
      />

      <div className="mt-auto flex w-full justify-end pt-1.5">
        <ThemeStyle
          defaultThemeStyle={themeStyle}
          setDefaultThemeStyle={changeThemeStyle}
        />
      </div>
    </main>
  );
}
// Главный экран рабочих режимов: связывает настройки, панели функций и предпросмотр.
