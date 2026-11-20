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
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
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
  const labelClass = "text-[10px] font-medium text-muted-foreground";
  const fieldClass = "flex min-w-0 flex-col gap-1";

  return (
    <div className="w-full min-w-0">
      <div className="flex w-full min-w-0 flex-col gap-2">
        {/* Тип содержимого */}
        <Tabs
          value={contentType === "text" ? `text-${textInputMode}` : contentType}
          onValueChange={(value) => {
            if (value === "text-single" || value === "text-sequence") {
              setContentType("text");
              setTextInputMode(value === "text-single" ? "single" : "sequence");
            } else if (value) {
              setContentType(value as Exclude<LabelContentType, "text">);
            }
          }}
          className="w-full min-w-0"
        >
          <TabsList
            aria-label="Тип содержимого этикетки"
            className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg border border-border/60 bg-muted/50 p-1"
          >
            <TabsTrigger value="text-single" className="h-8 min-w-0 gap-1 rounded-md px-1 text-[11px]">
              <Type className="size-3 shrink-0" />
              <span>Текст</span>
            </TabsTrigger>
            <TabsTrigger value="text-sequence" className="h-8 min-w-0 gap-1 rounded-md px-1 text-[11px]">
              <ListOrdered className="size-3 shrink-0" />
              <span>Диапазон</span>
            </TabsTrigger>
            {contentTypes.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="h-8 min-w-0 gap-1 rounded-md px-1 text-[11px]"
              >
                <Icon className="size-3 shrink-0" />
                <span className="truncate">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Текстовый раздел */}
        {/* Область ввода с постоянной высотой */}
        <div className="h-[112px] w-full min-w-0">
          {contentType === "text" ? (
            textInputMode === "single" ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Введите текст этикетки..."
                className="h-full min-h-0 w-full resize-none rounded-md px-2.5 py-2 text-xs"
              />
            ) : (
              <div className="flex h-full flex-col justify-between gap-2">
                {/* Начальное, конечное значения и шаг */}
                <div className="flex items-end justify-center gap-2">
                  <div className={fieldClass}>
                    <label className={labelClass}>Начальное значение</label>
                    <Input
                      value={sequence.start}
                      onChange={(e) => updateSequence("start", e.target.value)}
                      placeholder="001 или A001"
                      className="h-8 w-full min-w-0 rounded-md px-2 text-xs"
                    />
                  </div>

                  <div className={fieldClass}>
                    <label className={labelClass}>Конечное значение</label>
                    <Input
                      value={sequence.end}
                      onChange={(e) => updateSequence("end", e.target.value)}
                      placeholder="30 или A030"
                      className="h-8 w-full min-w-0 rounded-md px-2 text-xs"
                    />
                  </div>

                  <div className={fieldClass}>
                    <label className={labelClass}>Шаг</label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={sequence.step}
                      onChange={(e) => updateSequence("step", e.target.value)}
                      className="h-8 w-full min-w-0 rounded-md px-2 text-xs"
                    />
                  </div>
                </div>

                {/* Префикс и суффикс */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={fieldClass}>
                    <label className={labelClass}>Префикс</label>
                    <Input
                      value={sequence.prefix}
                      onChange={(e) => updateSequence("prefix", e.target.value)}
                      placeholder="Например, BOX-"
                      className="h-8 w-full min-w-0 rounded-md px-2 text-xs"
                    />
                  </div>

                  <div className={fieldClass}>
                    <label className={labelClass}>Суффикс</label>
                    <Input
                      value={sequence.suffix}
                      onChange={(e) => updateSequence("suffix", e.target.value)}
                      placeholder="Необязательно"
                      className="h-8 w-full min-w-0 rounded-md px-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите данные для кодирования..."
              className="h-full min-h-0 w-full resize-none rounded-md px-2.5 py-2 text-xs"
            />
          )}
        </div>

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
                  Жирный шрифт
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
