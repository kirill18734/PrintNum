import PreviewPaper from "@/components/previewPaper";
import SettingsCreatePaper from "@/components/settingsCreatePaper";
import SettingsPrinter from "@/components/settingsPrinter";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/services/store";
import { backendClient } from "@/shared/api/backendClient";
import { parseSequence } from "@/shared/utils/parseElem";
import { AlertCircle, Printer } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";

export type LabelContentType = "text" | "barcode" | "qr" | "datamatrix";

type TextInputMode = "single" | "sequence";

interface SequenceConfig {
  start: string;
  end: string;
  step: string;
  prefix: string;
  suffix: string;
}

function numberToLetters(value: number): string {
  let result = "";

  while (value > 0) {
    value--;

    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }

  return result;
}

export default function CreateLabel({
  printer,
  listPrinters,
  setPrinter,
  paper,
  setPaper,
  listPapers,
  dataFonts,
  dataBackgrounds,
  printerOnline,
}: any) {
  const [contentByType, setContentByType] = useState<
    Record<LabelContentType, string>
  >({
    text: "",
    barcode: "",
    qr: "",
    datamatrix: "",
  });

  const [contentType, setContentType] = useState<LabelContentType>("text");
  const [isPrinting, setIsPrinting] = useState(false);

  const stopPrinting = useRef(false);
  // Новый стейт вместо старого рефа curSendPrintText
  const [currentPrintingItem, setCurrentPrintingItem] = useState("");

  const opacity_manual = useAppStore((state) => state.opacity_manual);
  const bold_manual = useAppStore((state) => state.bold_manual);
  const showCodeText = useAppStore((state) => state.showCodeText);
  const endLine_manual = useAppStore((state) => state.endLine_manual);
  const font_manual = useAppStore((state) => state.font_manual);
  const background_manual = useAppStore((state) => state.background_manual);
  const [codeImage, setCodeImage] = useState<string>("");
  const [previewFont_Manual, setPreviewFont_Manual] = useState<
    string | undefined
  >();
  const [previewBackground_Manual, setPreviewBackground_Manual] = useState<
    string | undefined
  >();

  const setSetting = useAppStore((state) => state.setSetting);

  const handleFontChange = (value: string) => {
    setSetting("font_manual", value);
    setPreviewFont_Manual(undefined);
  };

  const handleBackgroundChange = (value: string) => {
    setSetting("background_manual", value);
    setPreviewBackground_Manual(undefined);
  };

  const setOpacity_Manual = (value: number) =>
    setSetting("opacity_manual", value);
  const setBold_Manual = (value: boolean) => setSetting("bold_manual", value);
  const setShowCodeText = (value: boolean) => setSetting("showCodeText", value);
  const setEndLine_Manual = (value: boolean) =>
    setSetting("endLine_manual", value);

  const updateLabelContent = (value: string) =>
    setContentByType((current) => ({ ...current, [contentType]: value }));
  const [textInputMode, setTextInputMode] = useState<TextInputMode>("single");
  const [sequence, setSequence] = useState<SequenceConfig>({
    start: "1",
    end: "10",
    step: "1",
    prefix: "",
    suffix: "",
  });

  const sequenceResult = useMemo(() => {
    const { start, end, step, prefix, suffix } = sequence;

    const stepValue = Number(step);

    if (!step.trim() || !Number.isSafeInteger(stepValue) || stepValue < 1) {
      return {
        values: [] as string[],
        error: "Шаг должен быть целым числом не меньше 1",
      };
    }

    const parsed = parseSequence(start, end);

    if (!parsed) {
      return {
        values: [] as string[],
        error: "Проверьте начальное и конечное значения",
      };
    }

    const direction = parsed.start <= parsed.end ? 1 : -1;

    const count =
      Math.floor(Math.abs(parsed.end - parsed.start) / stepValue) + 1;

    if (count > 10000) {
      return {
        values: [] as string[],
        error: "Слишком много значений (максимум 10 000)",
      };
    }

    const values = Array.from({ length: count }, (_, index) => {
      const current = parsed.start + index * stepValue * direction;

      let value: string;

      if (parsed.type === "numeric") {
        value = String(current).padStart(parsed.width, "0");
      } else if (parsed.type === "letters") {
        value = numberToLetters(current);

        if (parsed.lowercase) {
          value = value.toLowerCase();
        }
      } else {
        const number = String(current).padStart(parsed.width, "0");

        const letterPrefix = parsed.lowercase
          ? parsed.letterPrefix.toLowerCase()
          : parsed.letterPrefix.toUpperCase();

        value = `${letterPrefix}${number}`;
      }

      return `${prefix}${value}${suffix}`;
    });

    return {
      values,
      error: null as string | null,
    };
  }, [sequence]);

  // Режим диапазона применим только к текстовым этикеткам.
  const isSequenceMode = contentType === "text" && textInputMode === "sequence";
  const sequenceValues = sequenceResult.values;

  const updateSequence = (key: keyof SequenceConfig, value: string) => {
    setSequence((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const PRINT_SCENARIOS = [
    {
      id: "offline",
      check: ({ printerOnline }: any) => !printerOnline,
      topText: () => <span>Принтер недоступен. Проверьте подключение</span>,
      topTextClass: "text-xs font-semibold text-red-500 animate-pulse",
      buttonText: "Распечатать",
      buttonDisabled: true,
      isStopButton: false,
      hasCustomBg: false,
    },
    {
      id: "single-printing",
      check: ({ printerOnline, isPrinting, textInputMode }: any) =>
        printerOnline && isPrinting && !isSequenceMode,
      topText: () => <span>Отправка на печать...</span>,
      topTextClass: "text-xs font-medium text-primary animate-bounce",
      buttonText: "Печать…",
      buttonDisabled: true,
      isStopButton: false,
      hasCustomBg: false,
    },
    {
      id: "sequence-printing",
      check: ({ printerOnline, isPrinting, textInputMode }: any) =>
        printerOnline && isPrinting && isSequenceMode,
      // Реализация Варианта 1 (со стрелочкой) + выделение значения контрастным фоном
      topText: (text: string) => (
        <span className="flex items-center gap-1.5">
          Отправка на печать ➔
          <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100 shadow-sm transition-all">
            {text || "..."}
          </span>
        </span>
      ),
      topTextClass:
        "text-xs font-semibold text-amber-700 dark:text-amber-400 animate-pulse",
      buttonText: "Остановить",
      buttonDisabled: false,
      isStopButton: true,
      hasCustomBg: true,
    },
    {
      id: "ready",
      check: ({ printerOnline, isPrinting }: any) =>
        printerOnline && !isPrinting,
      topText: () => <span>Готово к печати</span>,
      topTextClass: "text-xs text-muted-foreground",
      buttonText: "Распечатать",
      buttonDisabled: false,
      isStopButton: false,
      hasCustomBg: false,
    },
  ];

  {
    /* Находим активный сценарий интерфейса на основе текущего состояния */
  }
  const currentScenario =
    PRINT_SCENARIOS.find((scenario) =>
      scenario.check({ printerOnline, isPrinting, isSequenceMode }),
    ) || PRINT_SCENARIOS[PRINT_SCENARIOS.length - 1];

  const sendPrintJob = async () => {
    const content = contentByType[contentType];

    if (!isSequenceMode && !content) return;
    if (isSequenceMode && !sequenceValues.length) return;

    setIsPrinting(true);
    setCurrentPrintingItem(""); // Очищаем перед стартом новой сессии
    stopPrinting.current = false; // Сбрасываем флаг отмены в false

    try {
      if (!isSequenceMode) {
        // Одиночная отправка
        await backendClient.printLabel({
          contentType,
          content,
          codeImage: codeImage || undefined,
        });
      } else {
        // Последовательная отправка
        for (const elem of sequenceValues) {
          // 1. Проверяем флаг остановки перед каждой итерацией
          if (stopPrinting.current) {
            console.log("Печать остановлена пользователем");
            break;
          }

          // 2. Обновляем стейт текущего элемента — это мгновенно вызывает ререндер и меняет текст на экране
          setCurrentPrintingItem(elem);

          // 3. Ждем ответ от сервера
          const response = await backendClient.printLabel({
            contentType,
            content: elem,
          });

          // 4. Проверяем корректность статуса ответа
          if (!response || response.status !== "printed") {
            console.error("Прерывание печати: некорректный статус от сервера");
            break;
          }
        }
      }
    } catch (error) {
      console.error("Ошибка при отправке на печать:", error);
    } finally {
      // Гарантированно выключаем статус печати и очищаем стейты
      setIsPrinting(false);
      stopPrinting.current = false;
      setCurrentPrintingItem("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      <SettingsPrinter
        printer={printer}
        listPrinters={listPrinters}
        setPrinter={setPrinter}
        paper={paper}
        setPaper={setPaper}
        listPapers={listPapers}
        printerOnline={printerOnline}
      />
      <div className="flex flex-col w-full rounded-xl border border-border bg-card p-2.5 gap-2">
        <div className="flex items-center justify-center gap-1">
          <SettingsCreatePaper
            contentType={contentType}
            setContentType={setContentType}
            content={contentByType[contentType]}
            setContent={updateLabelContent}
            bold={bold_manual}
            setBold={setBold_Manual}
            opacity={opacity_manual}
            setOpacity={setOpacity_Manual}
            underline={endLine_manual}
            setUnderline={setEndLine_Manual}
            showCodeText={showCodeText}
            setShowCodeText={setShowCodeText}
            sequence={sequence}
            updateSequence={updateSequence}
            textInputMode={textInputMode}
            setTextInputMode={setTextInputMode}
            font={font_manual}
            setFont={handleFontChange}
            dataFonts={dataFonts}
            background={background_manual}
            setBackground={handleBackgroundChange}
            dataBackgrounds={dataBackgrounds}
            onPreviewFont_Manual={setPreviewFont_Manual}
            onPreviewBackground_Manual={setPreviewBackground_Manual}
          />
          <div className="flex flex-col w-full gap-2">
            <PreviewPaper
              mode="create"
              contentType={contentType}
              bold={bold_manual}
              underline={endLine_manual}
              content={contentByType[contentType]}
              showCodeText={showCodeText}
              setCodeImage={setCodeImage}
              textInputMode={textInputMode}
              font={previewFont_Manual ?? font_manual}
              sequenceValue={`${sequenceValues.length && sequenceValues[0]}`}
              background={previewBackground_Manual ?? background_manual}
              dataBackgrounds={dataBackgrounds}
              opacity={opacity_manual}
            />
            {/* Предпросмотр */}

            {/* Зарезервированная область для результатов диапазона */}
            <div className="min-h-[84px]">
              {isSequenceMode && (
                <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-2.5">
                  {sequenceResult.error ? (
                    <div className="flex items-start gap-2 text-destructive">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <p className="text-xs">{sequenceResult.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Printer className="size-3.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground">
                            Будет напечатано
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {sequenceValues.length} значений
                          </p>
                        </div>

                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold tabular-nums text-primary">
                          {sequenceValues.length}
                        </span>
                      </div>

                      <div className="my-2 border-t border-primary/10" />

                      <div className="flex flex-wrap gap-1.5">
                        {sequenceValues.slice(0, 5).map((value, index) => (
                          <span
                            key={index}
                            className="rounded-md border border-primary/15 bg-background px-2 py-1 text-xs font-medium tabular-nums text-foreground"
                          >
                            {value}
                          </span>
                        ))}

                        {sequenceValues.length > 6 && (
                          <span className="flex items-center px-1 text-xs font-medium text-primary">
                            +{sequenceValues.length - 6}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
          {/* Элемент 1: Статичное сообщение статуса с общим фоном для серии */}
          <div
            className={`h-7 px-3 flex items-center justify-center rounded-md transition-all duration-200 ${
              currentScenario.hasCustomBg
                ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-900/30"
                : "bg-transparent border border-transparent"
            }`}
          >
            <span className={currentScenario.topTextClass}>
              {/* Вызываем функцию, которая отрендерит текст со стрелочкой и подсвеченным бейджем */}
              {currentScenario.topText(currentPrintingItem)}
            </span>
          </div>

          {/* Элемент 2: Кнопка управления (Всегда зафиксирована на своем месте) */}
          <Button
            type="button"
            disabled={currentScenario.buttonDisabled}
            onClick={
              currentScenario.isStopButton
                ? () => {
                    stopPrinting.current = true;
                  }
                : sendPrintJob
            }
            className={`h-9 w-full shrink-0 rounded-lg text-sm sm:w-auto font-medium transition-all ${
              currentScenario.isStopButton
                ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                : ""
            }`}
          >
            {isPrinting && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {currentScenario.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
