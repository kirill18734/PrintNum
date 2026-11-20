import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import type { PaperFormat } from "@/config/defaultConfig";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const PAPER_FORMAT_REGEX = /^\d+\*\d+$/;

interface PaperProps {
  paper: string;
  listPapers: PaperFormat[];
  setPaper: (value: string) => void;
}

export default function Paper({ paper, listPapers, setPaper }: PaperProps) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [open, setOpen] = useState(false);

  const isStandardPaper = listPapers.some(
    (item) => item.id === paper && item.id !== "custom_size",
  );

  const isCustomPaper = Boolean(
    paper && !isStandardPaper && PAPER_FORMAT_REGEX.test(paper),
  );

  const isCustomMode = paper === "custom_size" || isCustomPaper;

  // Валидация строки: оставляет только цифры и убирает ведущие нули.
  const validateDimension = (value: string): string => {
    const onlyDigits = value.replace(/\D/g, "");
    const noLeadingZeros = onlyDigits.replace(/^0+/, "");
    return !noLeadingZeros ? "10" : noLeadingZeros;
  };

  // Синхронизация локальных полей с внешним значением paper.
  useEffect(() => {
    if (paper === "custom_size") return;

    if (isCustomPaper) {
      const [w, h] = paper.split("*");
      const validW = validateDimension(w);
      const validH = validateDimension(h);

      if (validW !== w || validH !== h) {
        setPaper(`${validW}*${validH}`);
      } else {
        setWidth(validW);
        setHeight(validH);
      }

      return;
    }

    // Сохраняем предыдущие значения при выборе стандартного формата.
    if (isStandardPaper) return;

    const defaultPaper = listPapers[0]?.id || "30*20";
    setPaper(defaultPaper);
  }, [paper, isCustomPaper, isStandardPaper, listPapers, setPaper]);

  const handleBlur = () => {
    const validWidth = validateDimension(width);
    const validHeight = validateDimension(height);

    setWidth(validWidth);
    setHeight(validHeight);
    setPaper(`${validWidth}*${validHeight}`);
  };

  const handleSelectChange = (id: string) => {
    if (id === "custom_size") {
      const validWidth = validateDimension(width);
      const validHeight = validateDimension(height);

      setWidth(validWidth);
      setHeight(validHeight);
      setPaper(`${validWidth}*${validHeight}`);

      // Оставляем Select открытым после выбора собственного размера.
      setOpen(true);
      return;
    }

    setPaper(id);
    setOpen(false);
  };

  const selectValue = isCustomMode ? "custom_size" : paper;

  // Название собственного размера для закрытого Select.
  const customPaperLabel = `Свой размер: ${width}×${height} мм`;

  return (
    <div
      data-tauri-drag-region
      className="flex flex-1 min-w-0 flex-col items-start gap-0.5"
    >
      <span className="text-[11px] font-medium leading-none text-muted-foreground">
        Этикетка (мм)
      </span>

      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <Select
          open={open}
          onOpenChange={setOpen}
          value={selectValue}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="h-8 w-full min-w-0 text-xs">
            <SelectValue placeholder="Выберите этикетку">
              <span className="block min-w-0 truncate">
                {isCustomMode ? customPaperLabel : paper}
              </span>
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {listPapers.map((item) => (
                <SelectItem
                  value={item.id}
                  key={item.id}
                  className={`text-xs ${
                    item.isCustom ? "font-medium text-primary" : ""
                  }`}
                >
                  {item.isCustom ? "Свой размер" : item.label}
                </SelectItem>
              ))}
            </SelectGroup>

            {isCustomMode && (
              <div
                className="flex w-full items-center gap-1 px-2 pb-2 pt-2 animate-in fade-in duration-200"
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="Ширина"
                  value={width}
                  onChange={(e) => setWidth(e.target.value.replace(/\\D/g, ""))}
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-7 min-w-0 px-1 text-center text-xs"
                />

                <span className="text-[10px] font-medium text-muted-foreground">
                  ×
                </span>

                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="Высота"
                  value={height}
                  onChange={(e) => setHeight(e.target.value.replace(/\\D/g, ""))}
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-7 min-w-0 px-1 text-center text-xs"
                />
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
