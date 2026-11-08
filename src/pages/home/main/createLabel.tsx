import PreviewPaper from "@/components/previewPaper";
import SettingsCreatePaper from "@/components/settingsCreatePaper";
import SettingsPrinter from "@/components/settingsPrinter";
import { Button } from "@/components/ui/button";
import { parseSequence } from "@/shared/utils/parseElem";
import { AlertCircle, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  const [labelBold, setLabelBold] = useState(false);
  const [font, setFont] = useState("Arial");
  const [background, setBackground] = useState("Без фона");
  const [labelUnderline, setLabelUnderline] = useState(false);
  const [showCodeText, setShowCodeText] = useState(true);
  const [sequenceValues, setSequenceValues] = useState<string[]>([]);

  const updateLabelContent = (value: string) =>
    setContentByType((current) => ({ ...current, [contentType]: value }));
  const [textInputMode, setTextInputMode] = useState<TextInputMode>("single");
  const [sequence, setSequence] = useState<SequenceConfig>({
    start: "1",
    end: "30",
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

  // Генерация последовательности
  const sequenceValuesList = sequenceResult.values;

  // Передача последовательности родительскому компоненту
  useEffect(() => {
    if (contentType === "text" && textInputMode === "sequence") {
      setSequenceValues?.(sequenceValuesList);
    }
  }, [contentType, textInputMode, sequenceValuesList, setSequenceValues]);

  const updateSequence = (key: keyof SequenceConfig, value: string) => {
    setSequence((prev) => ({
      ...prev,
      [key]: value,
    }));
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
      />
      <div className="flex flex-col w-full rounded-xl border border-border bg-card p-2.5 gap-2">
        <div className="flex items-center justify-center gap-1">
          <SettingsCreatePaper
            contentType={contentType}
            setContentType={setContentType}
            content={contentByType[contentType]}
            setContent={updateLabelContent}
            bold={labelBold}
            setBold={setLabelBold}
            underline={labelUnderline}
            setUnderline={setLabelUnderline}
            showCodeText={showCodeText}
            setShowCodeText={setShowCodeText}
            sequence={sequence}
            updateSequence={updateSequence}
            textInputMode={textInputMode}
            setTextInputMode={setTextInputMode}
            font={font}
            setFont={setFont}
            dataFonts={dataFonts}
            background={background}
            setBackground={setBackground}
            dataBackgrounds={dataBackgrounds}
          />
          <div className="flex flex-col w-full gap-2">
            <PreviewPaper
              mode="create"
              contentType={contentType}
              bold={labelBold}
              underline={labelUnderline}
              content={contentByType[contentType]}
              showCodeText={showCodeText}
              textInputMode={textInputMode}
              font={font}
              sequenceValue={`${sequenceValues.length && sequenceValues[0]}`}
              background={background}
              dataBackgrounds={dataBackgrounds}
            />
            {/* Предпросмотр */}

            {textInputMode == "sequence" && contentType == "text" && (
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
        <Button
          type="button"
          onClick={() => {}}
          className="h-9 w-full shrink-0 rounded-lg text-sm sm:w-auto"
        >
          Распечатать
        </Button>
      </div>
    </div>
  );
}
