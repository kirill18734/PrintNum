import { useEffect, useState } from "react";
import type { BackgroundItem } from "@/types/api";
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
import { refreshBackgrounds } from "@/services/resources.tauri";

interface BackgroundProps {
  background: string;
  setBackground: (background: string) => void;
  dataBackgrounds: BackgroundItem[];
  opacity: number;
  setOpacity: (opacity: number) => void;
  onPreviewBackground: (background: string | undefined) => void;
}

export default function Background({
  background,
  setBackground,
  dataBackgrounds,
  opacity,
  setOpacity,
  onPreviewBackground,
}: BackgroundProps) {
  const [draftOpacity, setDraftOpacity] = useState(opacity);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setDraftOpacity(opacity);
  }, [opacity]);

  const getOpacityValue = (value: number | number[]): number | undefined =>
    Array.isArray(value) ? value[0] : value;

  const handleAddBackgrounds = async () => {
    if (isAdding) return;

    setIsAdding(true);
    try {
      await appService.addBackgroundImages();
      await refreshBackgrounds();
    } catch (error) {
      console.error("Не удалось обновить список фоновых изображений:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-2 w-full max-w-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          Фон
        </span>
        <div className="flex items-center gap-1 w-full justify-end">
          <Select
            value={background}
            onValueChange={setBackground}
            onOpenChange={(open) => {
              if (!open) onPreviewBackground(undefined);
            }}
          >
            <SelectTrigger className="w-full max-w-[140px] px-1.5 h-8 text-xs gap-1">
              <SelectValue placeholder="Выберите фон" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem
                  value="Без фона"
                  className="text-xs"
                  onPointerMove={() => onPreviewBackground("")}
                  onFocus={() => onPreviewBackground("")}
                >
                  Без фона
                </SelectItem>
                {dataBackgrounds.map((item) => (
                  <SelectItem
                    value={item.name}
                    key={item.id}
                    className="text-xs"
                    onPointerMove={() => onPreviewBackground(item.name)}
                    onFocus={() => onPreviewBackground(item.name)}
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => void handleAddBackgrounds()}
            disabled={isAdding}
            title="Добавить изображения"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <ImagePlus size={14} />
          </button>
        </div>
      </div>
      {background !== "Без фона" && (
        <div className="flex flex-col gap-1.5 w-full items-start">
          <label className="text-[10px] text-muted-foreground whitespace-nowrap select-none">
            Прозрачность
          </label>

          <div className="flex items-center gap-3 w-full">
            <Slider
              value={[draftOpacity]}
              onValueChange={(value: any) => {
                const nextOpacity = getOpacityValue(value);
                if (nextOpacity !== undefined) setDraftOpacity(nextOpacity);
              }}
              onValueCommitted={(value: any) => {
                const nextOpacity = getOpacityValue(value);
                if (nextOpacity !== undefined) {
                  setDraftOpacity(nextOpacity);
                  setOpacity(nextOpacity);
                }
              }}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <span className="text-[11px] text-muted-foreground min-w-[32px] text-right font-mono select-none">
              {draftOpacity}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
