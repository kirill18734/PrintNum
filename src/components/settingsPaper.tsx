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
    <div
      data-tauri-drag-region
      className="flex flex-col items-center justify-center w-full "
    >
      <div data-tauri-drag-region className="flex flex-col items-start ">
        {/* Показывать ID */}
        <Field orientation="horizontal" className="p-1 w-auto">
          <Checkbox
            id="checkbox-idNum"
            checked={idNum}
            onCheckedChange={setIdNum}
          />
          <FieldLabel htmlFor="checkbox-idNum">Показывать ID</FieldLabel>
        </Field>

        {/* Нижняя линия */}
        <Field orientation="horizontal" className="p-1 w-auto">
          <Checkbox
            id="checkbox-line"
            checked={endLine}
            onCheckedChange={setEndLine}
          />
          <FieldLabel htmlFor="checkbox-line">Подчёркивание</FieldLabel>
        </Field>
        {/* Гибридный формат */}
        <div
          data-tauri-drag-region
          className={`flex flex-col items-center justify-center rounded-lg p-1  ${
            hybrid ? "border border-border bg-muted/30" : ""
          }`}
        >
          <Field orientation="horizontal">
            <Checkbox
              id="checkbox-hybrid"
              checked={hybrid}
              onCheckedChange={setHybrid}
            />
            <FieldLabel htmlFor="checkbox-hybrid">Гибридный формат</FieldLabel>
          </Field>
          {hybrid && (
            <div className="flex flex-col gap-1 pl-6">
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
                  className="h-8 w-8"
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
                  className="
      h-8 w-16 text-center
      [appearance:textfield]
      [&::-webkit-outer-spin-button]:appearance-none
      [&::-webkit-inner-spin-button]:appearance-none
    "
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
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
