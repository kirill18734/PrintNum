import { useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "@/components/ui/slider";
import {
  addResourceFiles,
  deleteResource,
} from "@/services/resourceManager.tauri";
import { useAppStore } from "@/services/store";
import { toast } from "@/components/ui/toast";

interface BackgroundProps {
  background: string;
  setBackground: (background: string) => void;
  dataBackgrounds: string[];
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
      if (result.added > 0 || result.skipped > 0) {
        toast.add({
          title:
            result.skipped > 0
              ? `Добавлено: ${result.added}. Пропущено: ${result.skipped}.`
              : `Добавлено фонов: ${result.added}`,
          type: result.skipped > 0 ? "warning" : "success",
        });
      }
    } catch (error) {
      console.error("Не удалось добавить фон:", error);
      toast.add({ title: "Не удалось добавить фон", type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteBackground = async (selectedName: string) => {
    if (selectedName === "Без фона" || isDeleting) return;
    if (!window.confirm(`Удалить фон «${selectedName}»?`)) return;

    setIsDeleting(true);
    try {
      await deleteResource("background", selectedName);
      const store = useAppStore.getState();
      if (store.background === selectedName)
        await store.setSetting("background", "Без фона");
      if (store.background_manual === selectedName)
        await store.setSetting("background_manual", "Без фона");

      setBackground("Без фона");
      onPreviewBackground(undefined);
      toast.add({ title: "Фон удалён", type: "success" });
    } catch (error) {
      console.error("Не удалось удалить фон:", error);
      toast.add({ title: "Не удалось удалить фон", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-1 rounded-lg border border-border bg-muted/30 p-2">
      <div className="flex items-center justify-between gap-1">
        <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
          Фон
        </span>
        <div className="flex w-full min-w-0 items-center justify-end gap-1">
          <Select
            value={background}
            onValueChange={setBackground}
            onOpenChange={(open) => {
              if (!open) onPreviewBackground(undefined);
            }}
          >
            <SelectTrigger className="h-8 w-full max-w-[140px] min-w-0 flex-1 gap-1 px-1.5 text-xs">
              <SelectValue
                className="block min-w-0 flex-1 truncate text-left"
                placeholder="Выберите фон"
              />
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

                {dataBackgrounds.map((name) => (
                  <SelectItem
                    value={name}
                    key={name}
                    className="text-xs"
                    onPointerMove={() => onPreviewBackground(name)}
                    onFocus={() => onPreviewBackground(name)}
                  >
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            type="button"
            onClick={() => void handleDeleteBackground(background)}
            disabled={background === "Без фона" || isDeleting}
            title={background === "Без фона" ? "Стандартный фон нельзя удалить" : `Удалить фон «${background}»`}
            aria-label={background === "Без фона" ? "Удаление недоступно" : `Удалить фон «${background}»`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
          >
            <Trash2 size={14} />
          </Button>

          <Button
            variant="ghost"
            type="button"
            onClick={() => void handleAddBackgrounds()}
            disabled={isAdding}
            title="Добавить изображения"
            aria-label="Добавить фон"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <ImagePlus size={14} />
          </Button>
        </div>
      </div>
      {background !== "Без фона" && (
        <div className="flex w-full flex-col items-start gap-1">
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
