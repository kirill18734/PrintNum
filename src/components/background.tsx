import { ImagePlus } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { appService } from "@/services/app.tauri";

interface BackgroundProps {
  background: string;
  setBackground: (background: string) => void;
  dataBackgrounds: any;
  opacity: number;
  setOpacity: (opacity: number) => void;
}

export default function Background({
  background,
  setBackground,
  dataBackgrounds,
  opacity,
  setOpacity,
}: BackgroundProps) {
  return (
    // Общая обертка с фоном bg-muted/30 и границами
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-2 w-full max-w-sm">
      {/* Верхняя строка: Выбор фона */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          Фон
        </span>
        <div className="flex items-center gap-1 w-full justify-end">
          <Select value={background} onValueChange={setBackground}>
            <SelectTrigger className="w-full max-w-[140px] px-1.5 h-8 text-xs gap-1">
              <SelectValue placeholder="Выберите фон" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {dataBackgrounds.map((item: any) => (
                  <SelectItem
                    value={item.name}
                    key={item.name}
                    className="text-xs"
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={appService.addBackgroundImages}
            title="Добавить изображения"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ImagePlus size={14} />
          </button>
        </div>
      </div>

      {/* Нижний блок: Прозрачность под словом */}
      <div className="flex flex-col gap-1.5 w-full items-start">
        <label className="text-[10px] text-muted-foreground whitespace-nowrap select-none">
          Прозрачность
        </label>

        <div className="flex items-center gap-3 w-full">
          <Slider
            value={[opacity]}
            onValueChange={(value: any) => setOpacity(value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <span className="text-[11px] text-muted-foreground min-w-[32px] text-right font-mono select-none">
            {opacity}%
          </span>
        </div>
      </div>
    </div>
  );
}
