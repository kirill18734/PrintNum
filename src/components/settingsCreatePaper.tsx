import {
  Barcode,
  Grid3X3,
  QrCode,
  Text,
  ListOrdered,
  Type,
} from "lucide-react";
import { Field, FieldLabel } from "./ui/field";
import { Checkbox } from "./ui/checkbox";
import Font from "./font";

export type LabelContentType = "text" | "barcode" | "qr" | "datamatrix";

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
  sequence: any;
  updateSequence: any;
  textInputMode: string;
  setTextInputMode: any;
  font: string;
  setFont: any;
  listFonts: string[];
}

const contentTypes = [
  { id: "text", label: "Текст", icon: Text },
  { id: "barcode", label: "Штрихкод", icon: Barcode },
  { id: "qr", label: "QR-код", icon: QrCode },
  { id: "datamatrix", label: "Data Matrix", icon: Grid3X3 },
] satisfies {
  id: LabelContentType;
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
  listFonts,
}: LabelStudioProps) {
  const inputClass =
    "h-8 w-full min-w-0 rounded-md border border-input bg-background px-2 text-xs outline-none transition-colors hover:border-ring/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15";

  const labelClass = "text-[10px] font-medium text-muted-foreground";
  const fieldClass = "flex min-w-0 flex-col gap-1";

  const textareaClass = `
    block min-h-[64px] w-full resize-none
    rounded-md border border-input bg-background
    px-2.5 py-2 text-xs outline-none
    placeholder:text-muted-foreground/70
    focus-visible:border-primary
    focus-visible:ring-2 focus-visible:ring-primary/15
  `;

  return (
    <div className="w-full min-w-0">
      <div className="flex w-full min-w-0 flex-col gap-2">
        {/* Тип содержимого */}
        <div
          role="tablist"
          aria-label="Тип содержимого этикетки"
          className="grid grid-cols-2 gap-1 rounded-lg border border-border/60 bg-muted/50 p-1"
        >
          {contentTypes.map(({ id, label, icon: Icon }) => {
            const active = contentType === id;

            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setContentType(id)}
                className={`
                  flex min-h-8 items-center justify-center gap-1
                  rounded-md px-1 text-[11px] font-medium
                  transition-all
                  ${
                    active
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  }
                `}
              >
                <Icon className="size-3 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Текстовый раздел */}
        {contentType === "text" ? (
          <div className="flex w-full flex-col gap-2">
            {/* Режим ввода */}
            <div className="flex w-full items-center">
              <div className="flex w-full rounded-md bg-muted/50 p-0.5">
                <button
                  type="button"
                  onClick={() => setTextInputMode("single")}
                  className={`
        flex  min-w-0 h-7 items-center justify-center gap-1 rounded px-4
        text-[10px] font-medium transition-all
        ${
          textInputMode === "single"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }
      `}
                >
                  <Type className="size-3 shrink-0" />
                  Текст
                </button>

                <button
                  type="button"
                  onClick={() => setTextInputMode("sequence")}
                  className={`
        flex flex-1 min-w-0 h-7 items-center justify-center gap-1 rounded px-2
        text-[10px] font-medium transition-all
        ${
          textInputMode === "sequence"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }
      `}
                >
                  <ListOrdered className="size-3 shrink-0" />
                  Последовательность
                </button>
              </div>
            </div>

            {textInputMode === "single" ? (
              <>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Введите текст этикетки..."
                  rows={2}
                  className={textareaClass}
                />

                <div className="text-right text-[10px] text-muted-foreground">
                  {content.length} символов
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Начальное, конечное значения и шаг */}
                <div className="flex items-end justify-center gap-2">
                  <div className={fieldClass}>
                    <label className={labelClass}>Начальное значение</label>
                    <input
                      value={sequence.start}
                      onChange={(e) => updateSequence("start", e.target.value)}
                      placeholder="001 или A001"
                      className={inputClass}
                    />
                  </div>

                  <div className={fieldClass}>
                    <label className={labelClass}>Конечное значение</label>
                    <input
                      value={sequence.end}
                      onChange={(e) => updateSequence("end", e.target.value)}
                      placeholder="030 или A030"
                      className={inputClass}
                    />
                  </div>

                  <div className={fieldClass}>
                    <label className={labelClass}>Шаг</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={sequence.step}
                      onChange={(e) => updateSequence("step", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Префикс и суффикс */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={fieldClass}>
                    <label className={labelClass}>Префикс</label>
                    <input
                      value={sequence.prefix}
                      onChange={(e) => updateSequence("prefix", e.target.value)}
                      placeholder="Например, BOX-"
                      className={inputClass}
                    />
                  </div>

                  <div className={fieldClass}>
                    <label className={labelClass}>Суффикс</label>
                    <input
                      value={sequence.suffix}
                      onChange={(e) => updateSequence("suffix", e.target.value)}
                      placeholder="Необязательно"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Данные для штрихкода, QR и Data Matrix */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите данные для кодирования..."
              rows={2}
              className={textareaClass}
            />

            <div className="text-right text-[10px] text-muted-foreground">
              {content.length} символов
            </div>
          </>
        )}

        {/* Настройки форматирования */}
        <div className="flex flex-wrap items-center gap-1 border-t border-border/50 pt-2">
          {contentType === "text" ? (
            <>
              <Field
                orientation="horizontal"
                className="flex items-center gap-1.5"
              >
                <Checkbox
                  id="checkbox-labelBold"
                  checked={bold}
                  onCheckedChange={setBold}
                  className="size-3.5"
                />
                <FieldLabel
                  htmlFor="checkbox-labelBold"
                  className="cursor-pointer select-none text-[11px] font-normal"
                >
                  Жирный
                </FieldLabel>
              </Field>

              <Field
                orientation="horizontal"
                className="flex items-center gap-1.5"
              >
                <Checkbox
                  id="checkbox-labelUnderline"
                  checked={underline}
                  onCheckedChange={setUnderline}
                  className="size-3.5"
                />
                <FieldLabel
                  htmlFor="checkbox-labelUnderline"
                  className="cursor-pointer select-none text-[11px] font-normal"
                >
                  Подчёркивание
                </FieldLabel>
              </Field>
            </>
          ) : (
            <Field
              orientation="horizontal"
              className="flex items-center gap-1.5"
            >
              <Checkbox
                id="checkbox-labelShowText"
                checked={showCodeText}
                onCheckedChange={setShowCodeText}
                className="size-3.5"
              />
              <FieldLabel
                htmlFor="checkbox-labelShowText"
                className="cursor-pointer select-none text-[11px] font-normal"
              >
                Показывать текст под кодом
              </FieldLabel>
            </Field>
          )}

          {/* Шрифт */}
          <Font font={font} setFont={setFont} listFonts={listFonts} />
        </div>
      </div>
    </div>
  );
}
