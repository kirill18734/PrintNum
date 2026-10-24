// Настройки отображения ID, подчёркивания, жирного шрифта, гибридного формата и номера расширения этикетки.
import type { ReactNode } from "react";
import LabelPreviewLayout from "./LabelPreviewLayout";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

interface SettingsPaperProps {
  idNum: boolean;
  setIdNum: (value: boolean) => void;
  endLine: boolean;
  setEndLine: (value: boolean) => void;
  bold: boolean;
  setBold: (value: boolean) => void;
  hybrid: boolean;
  setHybrid: (value: boolean) => void;
  expand: number | "";
  setExpand: (value: number | "") => void;
  preview: ReactNode;
  singleColumn?: boolean; // когда true — все чекбоксы слева, превью справа
}

export default function SettingsPaper({
  idNum,
  setIdNum,
  endLine,
  setEndLine,
  bold,
  setBold,
  hybrid,
  setHybrid,
  expand,
  setExpand,
  preview,
  singleColumn = false,
}: SettingsPaperProps) {
  const controls = (
    <>
      <Field orientation="horizontal" className="w-full items-center gap-1 px-0 py-0">
        <Checkbox id="checkbox-idNum" checked={idNum} onCheckedChange={setIdNum} />
        <FieldLabel className="text-[11px] leading-tight" htmlFor="checkbox-idNum">Показывать ID</FieldLabel>
      </Field>

      <Field orientation="horizontal" className="w-full items-center gap-1 px-0 py-0">
        <Checkbox id="checkbox-line" checked={endLine} onCheckedChange={setEndLine} />
        <FieldLabel className="text-[11px] leading-tight" htmlFor="checkbox-line">Подчёркивание</FieldLabel>
      </Field>

      <Field orientation="horizontal" className="w-full items-center gap-1 px-0 py-0">
        <Checkbox id="checkbox-bold" checked={bold} onCheckedChange={setBold} />
        <FieldLabel className="text-[11px] leading-tight" htmlFor="checkbox-bold">Жирный шрифт</FieldLabel>
      </Field>

      <div className={`flex w-full flex-wrap items-center gap-x-1 rounded px-0 ${hybrid ? "bg-muted/30" : ""}`}>
        <Field orientation="horizontal" className="w-full items-center gap-1 px-0 py-0">
          <Checkbox id="checkbox-hybrid" aria-describedby="hybrid-format-hint" checked={hybrid} onCheckedChange={setHybrid} />
          <FieldLabel className="text-[11px] leading-tight" htmlFor="checkbox-hybrid">Гибридный формат</FieldLabel>
        </Field>
        {hybrid && (
          <div className="mt-1 w-full min-w-0">
            <label htmlFor="expand-value" className="text-[10px] text-muted-foreground">Начиная с номера</label>
            <div className="flex min-w-0 items-center gap-0.5">
              <Button type="button" variant="outline" size="icon" className="h-7 w-5 shrink-0 rounded-md" aria-label="Уменьшить начальный номер" onClick={() => setExpand(Math.max(1, Number(expand) - 1))}>−</Button>
              <Input id="expand-value" type="number" inputMode="numeric" min={1} value={expand}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") { setExpand(""); }
                  if (/^\d+$/.test(value)) { setExpand(Number(value)); }
                }}
                onBlur={() => { if (!Number.isInteger(Number(expand)) || Number(expand) < 1) setExpand(1); }}
                className="h-7 w-full min-w-0 rounded-md px-0.5 text-center text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button type="button" variant="outline" size="icon" className="h-7 w-5 shrink-0 rounded-md" aria-label="Увеличить начальный номер" onClick={() => setExpand(Number(expand) + 1)}>+</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return singleColumn ? (
    <LabelPreviewLayout preview={preview} left={controls} right={null} />
  ) : (
    <LabelPreviewLayout preview={preview} left={controls} right={<></>} />
  );
}
