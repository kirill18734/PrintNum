import Background from "./background";
import type { FontItem, BackgroundItem } from "@/types/api";
import Font from "./font";
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
  const expandValue = String(expand ?? "");
  const isValidExpand = /^[1-9]\\d*$/.test(expandValue) &&
    Number.isSafeInteger(Number(expandValue));
  const isHybridActive = hybrid && isValidExpand;

  const handleExpandChange = (value: string) => {
    if (value === "") {
      setExpand("");
      setHybrid(false);
      return;
    }

    if (!/^\\d+$/.test(value)) {
      return;
    }

    const nextValue = Number(value);
    setExpand(nextValue);
    setHybrid(Number.isSafeInteger(nextValue) && nextValue >= 1);
  };

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-center size-full"
    >
      <div
        data-tauri-drag-region
        className="flex flex-col items-start justify-center gap-0.5"
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
          className={`flex w-full items-center gap-2 rounded-lg border p-2 transition-colors ${
            isHybridActive
              ? "border-green-700 bg-green-700 text-white"
              : "border-border bg-muted/40 text-muted-foreground"
          }`}
          role="group"
          aria-label="Автоперестановка"
        >
          <span className="min-w-0 flex-1 text-xs font-medium">
            Автоперестановка
          </span>

          <div
            className={`w-[136px] shrink-0 rounded-md border bg-background px-2 py-1 ${
              expandValue !== "" && !isValidExpand
                ? "border-destructive"
                : "border-input"
            }`}
          >
            <label
              htmlFor="expand-value"
              className="block text-[10px] leading-tight text-muted-foreground"
            >
              от №
            </label>
            <Input
              id="expand-value"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={expandValue}
              onChange={(e) => handleExpandChange(e.target.value)}
              aria-label="Начальный номер автоперестановки"
              aria-invalid={expandValue !== "" && !isValidExpand}
              className="h-6 border-0 bg-transparent p-0 text-base font-semibold tabular-nums shadow-none focus-visible:ring-0"
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
