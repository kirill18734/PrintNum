// Настройки отображения ID, подчёркивания, гибридного формата и номера расширения этикетки.
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

interface SettingsPaperProps {
  idNum: boolean;
  setIdNum: (value: boolean) => void;
  endLine: boolean;
  setEndLine: (value: boolean) => void;
  hybrid: boolean;
  setHybrid: (value: boolean) => void;
  expand: number | "";
  setExpand: (value: number | "") => void;
}

export default function SettingsPaper({
  idNum,
  setIdNum,
  endLine,
  setEndLine,
  hybrid,
  setHybrid,
  expand,
  setExpand,
}: SettingsPaperProps) {
  return (
    <div data-tauri-drag-region className="w-fit max-w-full min-w-0">
      <div className="flex w-full flex-col items-start gap-y-0.5">
        {/* Показывать ID */}
        <Field orientation="horizontal" className="w-full items-center gap-1 px-0 py-0">
          <Checkbox
            id="checkbox-idNum"
            checked={idNum}
            onCheckedChange={setIdNum}
          />
          <FieldLabel className="whitespace-nowrap text-[11px]" htmlFor="checkbox-idNum">
            Показывать ID
          </FieldLabel>
        </Field>

        {/* Нижняя линия */}
        <Field orientation="horizontal" className="w-full items-center gap-1 px-0 py-0">
          <Checkbox
            id="checkbox-line"
            checked={endLine}
            onCheckedChange={setEndLine}
          />
          <FieldLabel className="whitespace-nowrap text-[11px]" htmlFor="checkbox-line">
            Подчёркивание
          </FieldLabel>
        </Field>
        {/* Гибридный формат */}
        <div
          className={`flex w-full flex-wrap items-center gap-x-1 rounded px-0 ${
            hybrid ? "bg-muted/30" : ""
          }`}
        >
          <Field orientation="horizontal" className="w-full items-center gap-1 px-0 py-0">
            <Checkbox
              id="checkbox-hybrid"
              checked={hybrid}
              onCheckedChange={setHybrid}
            />
            <FieldLabel className="whitespace-nowrap text-[11px]" htmlFor="checkbox-hybrid">
              Гибридный формат
            </FieldLabel>
          </Field>
          {hybrid && (
            <div className="flex items-center gap-0.5 pl-6">
              <label htmlFor="expand-value" className="sr-only">
                Начиная с номера
              </label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  onClick={() => setExpand(Math.max(1, Number(expand) - 1))}
                >
                  −
                </Button>

                <Input
                  id="expand-value"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={expand}
                  onChange={(e) => {
                    const value = e.target.value;
                    // разрешаем пустое поле во время ввода
                    if (value === "") {
                      setExpand("");
                    }

                    // только целые числа
                    if (/^\d+$/.test(value)) {
                      setExpand(Number(value));
                    }
                  }}
                  onBlur={() => {
                    if (!Number.isInteger(Number(expand)) || Number(expand) < 1)
                      setExpand(1);
                  }}
                  className="h-7 w-14 rounded-md px-1 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  onClick={() => setExpand(Number(expand) + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
