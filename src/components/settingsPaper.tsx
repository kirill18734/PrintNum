import { useEffect, useState } from "react";
import Background from "./background";
import Font from "./font";
import { Repeat } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SettingsPaperProps {
  idNum: boolean;
  setIdNum: (checked: boolean) => void;
  endLine: boolean;
  setEndLine: (checked: boolean) => void;
  bold: boolean;
  setBold: (checked: boolean) => void;
  font: string;
  background: string;
  dataFonts: string[];
  dataBackgrounds: string[];
  hybrid: boolean;
  setHybrid: (checked: boolean) => void;
  expand: number | string;
  setExpand: (valueOrFn: any) => void;
  opacity: number;
  setOpacity: (value: number) => void;
  onPreviewFont: (font: string | undefined) => void;
  onPreviewBackground: (background: string | undefined) => void;
  onChangeFont: (font: string) => void;
  onChangeBackground: (background: string) => void;
}

export default function SettingsPaper({
  idNum,
  setIdNum,
  endLine,
  setEndLine,
  bold,
  setBold,
  font,
  dataFonts,
  background,
  dataBackgrounds,
  hybrid,
  setHybrid,
  expand,
  setExpand,
  opacity,
  setOpacity,
  onPreviewFont,
  onPreviewBackground,
  onChangeFont,
  onChangeBackground,
}: SettingsPaperProps) {
  const [expandValue, setExpandValue] = useState("");

  // Валидация значения по той же логике, что и размер paper.
  // Для автоперестановки пустое значение соответствует дефолту 0.
  const validateExpand = (value: string): string => {
    const onlyDigits = value.replace(/\D/g, "");
    const noLeadingZeros = onlyDigits.replace(/^0+/, "");
    return !noLeadingZeros ? "0" : noLeadingZeros;
  };

  // Синхронизация локального поля с внешним значением expand.
  useEffect(() => {
    const currentValue = String(expand ?? "0");
    const validValue = validateExpand(currentValue);

    if (validValue !== currentValue) {
      setExpand(Number(validValue));
    } else {
      setExpandValue(validValue === "0" ? "" : validValue);
    }

    if (validValue !== currentValue) {
      setExpandValue(validValue === "0" ? "" : validValue);
    }
  }, [expand, setExpand]);

  const isValidExpand =
    /^[1-9]\d*$/.test(expandValue) && Number.isSafeInteger(Number(expandValue));
  const isHybridActive = hybrid && isValidExpand;

  const handleExpandChange = (value: string) => {
    setExpandValue(value);

    const validValue = validateExpand(value);
    const nextValue = Number(validValue);
    const isValid =
      validValue !== "0" && Number.isSafeInteger(nextValue) && nextValue >= 1;

    // Пустое поле соответствует значению 0, чтобы старый номер
    // не восстанавливался при последующей синхронизации состояния.
    setExpand(isValid ? nextValue : 0);
    setHybrid(isValid);
  };

  const handleExpandBlur = () => {
    const validValue = validateExpand(expandValue);
    setExpandValue(validValue === "0" ? "" : validValue);
    setExpand(Number(validValue));
    setHybrid(
      Number.isSafeInteger(Number(validValue)) && Number(validValue) >= 1,
    );
  };

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-center size-full"
    >
      <div
        data-tauri-drag-region
        className="flex flex-col items-start justify-center gap-1"
      >
        {/* Форматирование текста */}
        <div className="grid grid-cols-3 gap-1 w-full">
          <Button
            type="button"
            variant={idNum ? "default" : "outline"}
            size="sm"
            className="w-full"
            title="ID"
            aria-label="Показывать ID"
            aria-pressed={idNum}
            onClick={() => setIdNum(!idNum)}
          >
            I'd
          </Button>

          <Button
            type="button"
            variant={endLine ? "default" : "outline"}
            size="sm"
            className="w-full"
            title="Подчёркивание"
            aria-label="Подчёркивание"
            aria-pressed={endLine}
            onClick={() => setEndLine(!endLine)}
          >
            <span className="underline underline-offset-2">U</span>
          </Button>

          <Button
            type="button"
            variant={bold ? "default" : "outline"}
            size="sm"
            className="w-full"
            title="Жирный шрифт"
            aria-label="Жирный шрифт"
            aria-pressed={bold}
            onClick={() => setBold(!bold)}
          >
            <span className="font-bold">B</span>
          </Button>
        </div>

        {/* Автоперестановка */}
        <div
          data-tauri-drag-region
          className={`flex w-full items-center gap-1 rounded-md border p-1 transition-colors ${
            isHybridActive
              ? "border-green-700 bg-green-700 text-white"
              : "border-border bg-muted/40 text-muted-foreground"
          }`}
          role="group"
          aria-label="Автоперестановка"
        >
          <Repeat aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 whitespace-nowrap text-[10px] font-medium">
            Автоперестановка
          </span>

          <div className="w-[72px] shrink-0">
            <label
              htmlFor="expand-value"
              className="mb-0.5 block whitespace-nowrap text-center text-[8px] leading-tight text-foreground/70"
            >
              Начиная с номера
            </label>
            <Input
              id="expand-value"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={expandValue}
              placeholder=""
              onChange={(e) =>
                handleExpandChange(e.target.value.replace(/\D/g, ""))
              }
              onBlur={handleExpandBlur}
              onKeyDown={(e) => e.stopPropagation()}
              aria-label="Начальный номер автоперестановки"
              aria-invalid={expandValue !== "" && !isValidExpand}
              className="h-5 border-0 bg-transparent p-3 text-center text-xs font-semibold tabular-nums shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Шрифт */}
        <Font
          font={font}
          setFont={onChangeFont}
          dataFonts={dataFonts}
          onPreviewFont={onPreviewFont}
        />
        {/* Фон */}
        <Background
          background={background}
          setBackground={onChangeBackground}
          dataBackgrounds={dataBackgrounds}
          opacity={opacity}
          setOpacity={setOpacity}
          onPreviewBackground={onPreviewBackground}
        />
      </div>
    </div>
  );
}
