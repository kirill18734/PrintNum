import {
  Barcode,
  Bold,
  Grid3X3,
  QrCode,
  Text,
  ListOrdered,
  Type,
  Underline,
} from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "@/components/ui/button";
import Font from "./font";
import Background from "./background";
import type {
  LabelContentType,
  SequenceConfig,
  SequenceConfigKey,
  TextInputMode,
} from "@/types/label";

interface LabelStudioProps {
  contentType: LabelContentType;
  setContentType: (value: LabelContentType) => void;
  content: string;
  setContent: (value: string) => void;
  bold: boolean;
  setBold: (value: boolean) => void;
  underline: boolean;
  setUnderline: (value: boolean) => void;
  showCodeText: boolean;
  setShowCodeText: (value: boolean) => void;
  sequence: SequenceConfig;
  updateSequence: (key: SequenceConfigKey, value: string) => void;
  textInputMode: TextInputMode;
  setTextInputMode: (mode: TextInputMode) => void;
  font: string;
  setFont: (font: string) => void;
  dataFonts: string[];
  background: string;
  setBackground: (value: string) => void;
  dataBackgrounds: string[];
  opacity: number;
  setOpacity: (value: number) => void;
  onPreviewFont_Manual: (font: string | undefined) => void;
  onPreviewBackground_Manual: (background: string | undefined) => void;
}

const contentTypes = [
  { id: "barcode", label: "Штрихкод", icon: Barcode },
  { id: "qr", label: "QR-код", icon: QrCode },
  { id: "datamatrix", label: "Data Matrix", icon: Grid3X3 },
] satisfies {
  id: Exclude<LabelContentType, "text">;
  label: string;
  icon: typeof Text;
}[];

export default function SettingsCreatePaper({
  contentType,
  setContentType,
  content,
  setContent,
  bold,
  setBold,
  underline,
  setUnderline,
  showCodeText,
  setShowCodeText,
  sequence,
  updateSequence,
  textInputMode,
  setTextInputMode,
  font,
  setFont,
  dataFonts,
  background,
  setBackground,
  dataBackgrounds,
  opacity,
  setOpacity,
  onPreviewFont_Manual,
  onPreviewBackground_Manual,
}: LabelStudioProps) {
  const rangeInputClass =
    "h-7 w-full min-w-0 rounded-md border border-input bg-background px-1.5 text-[11px] outline-none transition-colors hover:border-ring/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15";

  const labelClass = "text-[10px] font-medium text-muted-foreground";
  const fieldClass = "flex min-w-0 flex-col gap-1";

  const textareaClass = `
    block w-full resize-none
    rounded-md border border-input bg-background
    px-2.5 py-2 text-xs outline-none
    placeholder:text-muted-foreground/70
    focus-visible:border-primary
    focus-visible:ring-2 focus-visible:ring-primary/15
  `;

  return (
    <div className="w-full min-w-0">
      <div className="flex w-full min-w-0 flex-col gap-2">
        {/* Переключатели содержимого */}
        <div
          role="tablist"
          aria-label="Тип содержимого этикетки"
          className="flex w-full min-w-0 flex-col gap-1 rounded-lg border border-border/60 bg-muted/50 p-1"
        >
          {/* Текстовые режимы */}
          <div
            className={`
              grid grid-cols-2 gap-0.5 rounded-md p-0.5 transition-all
              ${
                contentType === "text"
                  ? "bg-muted-foreground/10 ring-1 ring-border/60"
                  : "bg-background/50"
              }
            `}
          >
            <Button
              variant="ghost"
              type="button"
              role="tab"
              aria-selected={
                contentType === "text" && textInputMode === "single"
              }
              onClick={() => {
                setContentType("text");
                setTextInputMode("single");
              }}
              className={`
                flex h-7 w-full items-center justify-center gap-1.5
                rounded-[5px] px-1.5 text-[11px] font-medium transition-all
                ${
                  contentType === "text" && textInputMode === "single"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                }
              `}
            >
              <Type className="size-3 shrink-0" />
              <span>Текст</span>
            </Button>

            <Button
              variant="ghost"
              type="button"
              role="tab"
              aria-selected={
                contentType === "text" && textInputMode === "sequence"
              }
              onClick={() => {
                setContentType("text");
                setTextInputMode("sequence");
              }}
              className={`
                flex h-7 w-full items-center justify-center gap-1.5
                rounded-[5px] px-1.5 text-[11px] font-medium transition-all
                ${
                  contentType === "text" && textInputMode === "sequence"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                }
              `}
            >
              <ListOrdered className="size-3 shrink-0" />
              <span>Диапазон</span>
            </Button>
          </div>

          {/* Типы кодов */}
          <div className="grid grid-cols-3 gap-1">
            {contentTypes.map(({ id, label, icon: Icon }) => {
              const active = contentType === id;
              return (
                <Button
                  variant="ghost"
                  key={id}
                  type="button"
                  role="tab"
                  title={label}
                  aria-selected={active}
                  onClick={() => setContentType(id)}
                  className={`
                    flex min-h-8 min-w-0 items-center justify-center gap-1
                    rounded-md bg-muted/30 px-1 text-[11px] font-medium transition-all
                    ${
                      active
                        ? "bg-muted-foreground/10 text-foreground shadow-sm ring-1 ring-border/60"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="size-3 shrink-0" />
                  <span className="truncate">{label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Текстовый раздел */}
        {/* Область ввода с постоянной высотой */}
        <div className="h-[100px] w-full min-w-0">
          {contentType === "text" ? (
            textInputMode === "single" ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Введите текст этикетки..."
                className={`${textareaClass} h-full min-h-0`}
              />
            ) : (
              <div className="flex h-full flex-col justify-start gap-2">
                {/* Начальное, конечное значения и шаг */}
                <div className="flex items-end justify-center gap-1">
                  <div className={fieldClass}>
                    <Label className={labelClass}>Начало</Label>
                    <Input
                      value={sequence.start}
                      onChange={(e) => updateSequence("start", e.target.value)}
                      placeholder="001 или A001"
                      className={rangeInputClass}
                    />
                  </div>

                  <div className={fieldClass}>
                    <Label className={labelClass}>Конец</Label>
                    <Input
                      value={sequence.end}
                      onChange={(e) => updateSequence("end", e.target.value)}
                      placeholder="30 или A030"
                      className={rangeInputClass}
                    />
                  </div>

                  <div className={fieldClass}>
                    <Label className={labelClass}>Шаг</Label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={sequence.step}
                      onChange={(e) => updateSequence("step", e.target.value)}
                      className={rangeInputClass}
                    />
                  </div>
                </div>

                {/* Префикс и суффикс */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={fieldClass}>
                    <Label className={labelClass}>Префикс</Label>
                    <Input
                      value={sequence.prefix}
                      onChange={(e) => updateSequence("prefix", e.target.value)}
                      placeholder="Например, BOX-"
                      className={rangeInputClass}
                    />
                  </div>

                  <div className={fieldClass}>
                    <Label className={labelClass}>Суффикс</Label>
                    <Input
                      value={sequence.suffix}
                      onChange={(e) => updateSequence("suffix", e.target.value)}
                      placeholder="Необязательно"
                      className={rangeInputClass}
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                contentType === "barcode"
                  ? "Введите данные для генерации штрихкода..."
                  : contentType === "qr"
                    ? "Введите данные для генерации QR-кода..."
                    : "Введите данные для генерации Data Matrix..."
              }
              className={`${textareaClass} h-full min-h-0`}
            />
          )}
        </div>

        {/* Настройки форматирования */}
        <div className="flex flex-wrap items-center gap-1 border-t border-border/50 pt-2">
          {contentType === "text" ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant={bold ? "default" : "outline"}
                aria-pressed={bold}
                onClick={() => setBold(!bold)}
                className="h-7 shrink-0 gap-1.5 px-2 text-[11px]"
              >
                <Bold className="size-3.5 shrink-0" />
                <span className="hidden min-[480px]:inline">Жирный</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant={underline ? "default" : "outline"}
                aria-pressed={underline}
                onClick={() => setUnderline(!underline)}
                className="h-7 shrink-0 gap-1.5 px-2 text-[11px]"
              >
                <Underline className="size-3.5 shrink-0" />
                <span className="hidden min-[480px]:inline">Подчёркивание</span>
              </Button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant={showCodeText ? "default" : "outline"}
                aria-pressed={showCodeText}
                onClick={() => setShowCodeText(!showCodeText)}
                className="h-7 shrink-0 gap-1.5 px-2 text-[11px]"
              >
                <Type className="size-3.5 shrink-0" />
                <span className="hidden min-[480px]:inline">
                  Текст под кодом
                </span>
              </Button>
            </div>
          )}

          {contentType === "text" && (
            <>
              <Font
                font={font}
                setFont={setFont}
                dataFonts={dataFonts}
                onPreviewFont={onPreviewFont_Manual}
              />
              <Background
                background={background}
                setBackground={setBackground}
                dataBackgrounds={dataBackgrounds}
                opacity={opacity}
                setOpacity={setOpacity}
                onPreviewBackground={onPreviewBackground_Manual}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
