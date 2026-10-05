import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

export default function SettingsPaper({
  idNum,
  setIdNum,
  endLine,
  setEndLine,
  hybrid,
  setHybrid,
  expand,
  setExpand,
}: any) {
  return (
    <div data-tauri-drag-region className="flex w-fit max-w-full flex-col">
      <div data-tauri-drag-region className="flex w-full flex-col items-start">
        {/* Показывать ID */}
        <Field orientation="horizontal" className="w-full items-center gap-2 px-1 py-0.5">
          <Checkbox
            id="checkbox-idNum"
            checked={idNum}
            onCheckedChange={setIdNum}
          />
          <FieldLabel className="text-[13px]" htmlFor="checkbox-idNum">
            Показывать ID
          </FieldLabel>
        </Field>

        {/* Нижняя линия */}
        <Field orientation="horizontal" className="w-full items-center gap-2 px-1 py-0.5">
          <Checkbox
            id="checkbox-line"
            checked={endLine}
            onCheckedChange={setEndLine}
          />
          <FieldLabel className="text-[13px]" htmlFor="checkbox-line">
            Подчёркивание
          </FieldLabel>
        </Field>
        {/* Гибридный формат */}
        <div
          data-tauri-drag-region
          className={`flex w-full flex-col items-start justify-center rounded-lg border px-1 py-0.5 ${
            hybrid ? "border-border bg-muted/30" : "border-transparent"
          }`}
        >
          <Field orientation="horizontal" className="w-full items-center gap-2">
            <Checkbox
              id="checkbox-hybrid"
              checked={hybrid}
              onCheckedChange={setHybrid}
            />
            <FieldLabel className="text-[13px]" htmlFor="checkbox-hybrid">
              Гибридный формат
            </FieldLabel>
          </Field>
          {hybrid && (
            <div className="flex flex-col gap-1 pl-6 pt-1">
              <label
                htmlFor="expand-value"
                className="text-xs text-muted-foreground"
              >
                Начиная с номера
              </label>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setExpand((num: any) => Math.max(1, num - 1))}
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
                  className="h-8 w-16 rounded-lg px-1 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setExpand((e: any) => ++e)}
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
