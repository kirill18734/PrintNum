import Background from "./background";
import Font from "./font";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

interface SettingsPaperProps {
  idNum: boolean;
  setIdNum: (checked: boolean) => void;
  endLine: boolean;
  setEndLine: (checked: boolean) => void;
  bold: boolean;
  setBold: (checked: boolean) => void;
  font: string;
  setFont: (font: string) => void;
  background: string;
  setBackground: (background: string) => void;
  dataFonts: any;
  dataBackgrounds: any;
  hybrid: boolean;
  setHybrid: (checked: boolean) => void;
  expand: number | string;
  setExpand: (valueOrFn: any) => void;
  opacity: number;
  setOpacity: (valueOrFn: any) => void;
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
  setFont,
  dataFonts,
  background,
  setBackground,
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
  const handleExpandChange = (
    action: "increment" | "decrement" | "blur" | string,
  ) => {
    let nextValue: number | string;

    if (action === "increment") {
      nextValue =
        typeof expand === "number" ? expand + 1 : Number(expand || 0) + 1;
    } else if (action === "decrement") {
      const current = typeof expand === "number" ? expand : Number(expand || 0);
      nextValue = Math.max(1, current - 1);
    } else if (action === "blur") {
      nextValue = expand === "" || Number(expand) < 1 ? 1 : Number(expand);
    } else {
      if (action === "") {
        nextValue = "";
      } else if (/^\d+$/.test(action)) {
        const num = Number(action);
        nextValue = num < 1 ? 1 : num;
      } else {
        return;
      }
    }

    setExpand(nextValue);
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
        {/* Показывать ID */}
        <Field
          orientation="horizontal"
          className="p-0.5 w-auto gap-2 justify-start"
        >
          <Checkbox
            id="checkbox-idNum"
            checked={idNum}
            onCheckedChange={setIdNum}
            className="h-3.5 w-3.5"
          />
          <FieldLabel htmlFor="checkbox-idNum" className="text-xs select-none">
            Показывать ID
          </FieldLabel>
        </Field>

        {/* Нижняя линия */}
        <Field
          orientation="horizontal"
          className="p-0.5 w-auto gap-2 justify-start"
        >
          <Checkbox
            id="checkbox-line"
            checked={endLine}
            onCheckedChange={setEndLine}
            className="h-3.5 w-3.5"
          />
          <FieldLabel htmlFor="checkbox-line" className="text-xs select-none">
            Подчёркивание
          </FieldLabel>
        </Field>

        {/* Жирный шрифт */}
        <Field
          orientation="horizontal"
          className="p-0.5 w-auto gap-2 justify-start"
        >
          <Checkbox
            id="checkbox-bold"
            checked={bold}
            onCheckedChange={setBold}
            className="h-3.5 w-3.5"
          />
          <FieldLabel htmlFor="checkbox-bold" className="text-xs select-none">
            Жирный шрифт
          </FieldLabel>
        </Field>

        {/* Гибридный формат */}
        <div
          data-tauri-drag-region
          className={`flex flex-col items-start justify-center rounded-lg p-0.5 transition-colors ${
            hybrid ? "border border-border bg-muted/30 w-full" : "w-auto"
          }`}
        >
          <Field
            orientation="horizontal"
            className="w-auto gap-2 justify-start"
          >
            <Checkbox
              id="checkbox-hybrid"
              checked={hybrid}
              onCheckedChange={setHybrid}
              className="h-3.5 w-3.5"
            />
            <FieldLabel
              htmlFor="checkbox-hybrid"
              className="text-xs select-none"
            >
              Гибридный формат
            </FieldLabel>
          </Field>

          {hybrid && (
            <div className="flex flex-col gap-0.5 pl-5.5 w-full items-start mt-0.5">
              <label
                htmlFor="expand-value"
                className="text-[10px] text-muted-foreground whitespace-nowrap"
              >
                Начиная с номера
              </label>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 text-xs"
                  onClick={() => handleExpandChange("decrement")}
                >
                  −
                </Button>

                <Input
                  id="expand-value"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={expand}
                  onChange={(e) => handleExpandChange(e.target.value)}
                  onBlur={() => handleExpandChange("blur")}
                  className="
                    h-6 w-12 text-center text-xs p-0
                    [appearance:textfield]
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none
                  "
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 text-xs"
                  onClick={() => handleExpandChange("increment")}
                >
                  +
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Шрифт */}
        <Font
          font={font}
          setFont={setFont}
          dataFonts={dataFonts}
          onPreviewFont={onPreviewFont}
        />
        {/* Фон */}
        <Background
          background={background}
          setBackground={setBackground}
          dataBackgrounds={dataBackgrounds}
          opacity={opacity}
          setOpacity={setOpacity}
          onPreviewBackground={onPreviewBackground}
        />
      </div>
    </div>
  );
}
