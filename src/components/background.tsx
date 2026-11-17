import { useEffect, useState } from "react";
import type { BackgroundItem } from "@/types/api";
import { ImagePlus, Trash2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { refreshBackgrounds } from "@/services/resources.tauri";
import { addResourceFiles, deleteResource } from "@/services/resourceManager.tauri";
import { useAppStore } from "@/services/store";
import { useToast } from "./ui/toast";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setDraftOpacity(opacity);
  }, [opacity]);

  const getOpacityValue = (value: number | number[]): number | undefined =>
    Array.isArray(value) ? value[0] : value;

  const handleAddBackgrounds = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const result = await addResourceFiles("background");
      await refreshBackgrounds();
      if (result.added > 0) showToast("Фон добавлен", "success");
      if (result.skipped > 0) showToast("Файл уже существует", "warning");
    } catch (error) {
      console.error("Не удалось добавить фон:", error);
      showToast("Не удалось добавить фон", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteBackground = async () => {
    const selected = dataBackgrounds.find((item) => item.name === background);
    if (!selected || isDeleting) return;
    if (!window.confirm(`Удалить фон «${selected.name}»?`)) return;

    setIsDeleting(true);
    try {
      const selectedName = selected.name;
      await deleteResource("background", selected.fileName ?? selectedName);
      const store = useAppStore.getState();
      if (store.background === selectedName) await store.setSetting("background", "Без фона");
      if (store.background_manual === selectedName) await store.setSetting("background_manual", "Без фона");
      await refreshBackgrounds();
      onPreviewBackground(undefined);
      showToast("Фон удалён", "success");
    } catch (error) {
      console.error("Не удалось удалить фон:", error);
      showToast("Не удалось удалить фон", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-border bg-muted/30 p-2">
      <div className="flex items-center justify-between gap-4">
        <span className="whitespace-nowrap text-xs text-muted-foreground">Фон</span>
        <div className="flex w-full items-center justify-end gap-1">
          <Select
            value={background}
            onValueChange={setBackground}
            onOpenChange={(open) => {
              if (!open) onPreviewBackground(undefined);
            }}
          >
            <SelectTrigger className="h-8 w-full max-w-[140px] gap-1 px-1.5 text-xs">
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
                    {item.fileName ?? item.name}
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
            aria-label="Добавить фон"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <ImagePlus size={14} />
          </button>
          <button
            type="button"
            onClick={() => void handleDeleteBackground()}
            disabled={!dataBackgrounds.some((item) => item.name === background) || isDeleting}
            title="Удалить выбранный фон"
            aria-label="Удалить выбранный фон"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 text-xs outline-none transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {background !== "Без фона" && (
        <div className="flex w-full flex-col items-start gap-1.5">
          <label className="select-none whitespace-nowrap text-[10px] text-muted-foreground">
            Прозрачность
          </label>
          <div className="flex w-full items-center gap-3">
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
            <span className="min-w-[32px] select-none text-right font-mono text-[11px] text-muted-foreground">
              {draftOpacity}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
