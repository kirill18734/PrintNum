import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const PAPER_FORMAT_REGEX = /^\d+\*\d+$/;

interface PaperFormat {
  id: string;
  label: string;
  isCustom?: boolean;
}

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

  const isCustomPaper =
    paper && !isStandardPaper && PAPER_FORMAT_REGEX.test(paper);

  // Валидация строки: оставляет только цифры и убирает ведущие нули
  const validateDimension = (value: string): string => {
    const onlyDigits = value.replace(/\D/g, "");
    const noLeadingZeros = onlyDigits.replace(/^0+/, "");
    return !noLeadingZeros ? "10" : noLeadingZeros;
  };

  // Проверка внешнего значения paper при инициализации и изменениях
  useEffect(() => {
    // 1. Если прилетело значение "custom_size" — это триггер клика, просто не трогаем
    if (paper === "custom_size") return;

    // 2. Если значение валидное кастомное (например, "58*40")
    if (isCustomPaper) {
      const [w, h] = paper.split("*");
      const validW = validateDimension(w);
      const validH = validateDimension(h);

      // Если после внутренней валидации размеры изменились (например, было "05*40" -> стало "5*40"),
      // исправляем внешнее состояние, чтобы в конфиг улетели чистые данные
      if (validW !== w || validH !== h) {
        setPaper(`${validW}*${validH}`);
      } else {
        setWidth(validW);
        setHeight(validH);
      }
      return;
    }

    // 3. Если это стандартное значение из списка (например, "30*20")
    if (isStandardPaper) {
      setWidth("");
      setHeight("");
      return;
    }

    // 4. КРИТИЧЕСКИЙ СЦЕНАРИЙ: Значение не стандартное И не валидное кастомное (сломанный конфиг)
    // Сбрасываем на первый доступный стандартный размер из списка listPapers
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
    } else {
      setPaper(id);
    }
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

      <div className="flex w-full flex-col gap-1.5">
        <Select value={selectValue} onValueChange={handleSelectChange}>
          <SelectTrigger className="h-8 w-full text-xs">
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
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {(paper === "custom_size" || isCustomPaper) && (
          <div className="flex items-center gap-1 w-full animate-in fade-in duration-200">
            <Input
              type="text"
              placeholder="Ширина"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              onBlur={handleBlur}
              className="h-7 text-center text-xs px-1"
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
              className="h-7 text-center text-xs px-1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
