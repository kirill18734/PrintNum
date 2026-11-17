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

const PAPER_FORMAT_REGEX = /^\\d+\\*\\d+$/;

interface PaperProps {
  paper: string;
  listPapers: PaperFormat[];
  setPaper: (value: string) => void;
}

export default function Paper({ paper, listPapers, setPaper }: PaperProps) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const isStandardPaper = listPapers.some(
    (item) => item.id === paper && item.id !== "custom_size",
  );

  const isCustomPaper = Boolean(
    paper && !isStandardPaper && PAPER_FORMAT_REGEX.test(paper),
  );
  const isCustomMode = paper === "custom_size" || isCustomPaper;

  // Валидация строки: оставляет только цифры и убирает ведущие нули.
  const validateDimension = (value: string): string => {
    const onlyDigits = value.replace(/\\D/g, "");
    const noLeadingZeros = onlyDigits.replace(/^0+/, "");
    return !noLeadingZeros ? "10" : noLeadingZeros;
  };

  // Синхронизация локальных полей с внешним значением paper.
  useEffect(() => {
    // "custom_size" используется как значение режима до ввода размеров.
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

    // При выборе стандартного размера не очищаем поля:
    // пользователь сможет вернуться к своему размеру с прежними значениями.
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
      return;
    }

    setPaper(id);
  };

  const selectValue = isCustomPaper ? "custom_size" : paper;

  return (
    <div
      data-tauri-drag-region
      className="flex flex-1 min-w-0 flex-col items-start gap-0.5"
    >
      <span className="text-[11px] font-medium leading-none text-muted-foreground">
        Этикетка (мм)
      </span>

      <div
        className={`flex w-full flex-col ${isCustomMode ? "overflow-hidden rounded-md border border-input" : "gap-1.5"}`}
      >
        <Select value={selectValue} onValueChange={handleSelectChange}>
          <SelectTrigger
            className={
              isCustomMode
                ? "h-7 w-full rounded-none border-0 bg-transparent px-2 text-xs shadow-none focus-visible:ring-0"
                : "h-8 w-full text-xs"
            }
          >
            <SelectValue placeholder="Выберите этикетку" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {listPapers.map((item) => (
                <SelectItem
                  value={item.id}
                  key={item.id}
                  className={`text-xs ${item.isCustom ? "font-medium text-primary" : ""}`}
                >
                  {item.isCustom ? "Свой размер" : item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {isCustomMode && (
          <div className="flex w-full items-center gap-1 px-2 pb-2 animate-in fade-in duration-200">
            <Input
              type="text"
              placeholder="Ширина"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              onBlur={handleBlur}
              className="h-7 min-w-0 text-center text-xs px-1"
            />
            <span className="text-[10px] text-muted-foreground font-medium">
              ×
            </span>
            <Input
              type="text"
              placeholder="Высота"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              onBlur={handleBlur}
              className="h-7 min-w-0 text-center text-xs px-1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
