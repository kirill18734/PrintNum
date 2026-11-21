import { useState } from "react";
import { Plus, Trash2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  addResourceFiles,
  deleteResource,
} from "@/services/resourceManager.tauri";
import { useAppStore } from "@/services/store";
import { toast } from "@/components/ui/toast";

interface FontProps {
  font: string;
  setFont: (font: string) => void;
  dataFonts: string[];
  onPreviewFont: (font: string | undefined) => void;
}

export default function Font({
  font,
  setFont,
  dataFonts,
  onPreviewFont,
}: FontProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddFonts = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const result = await addResourceFiles("font");
      if (result.added > 0 || result.skipped > 0) {
        toast.add({
          title:
            result.skipped > 0
              ? `Добавлено: ${result.added}. Пропущено: ${result.skipped}.`
              : `Добавлено шрифтов: ${result.added}`,
          type: result.skipped > 0 ? "warning" : "success",
        });
      }
    } catch (error) {
      console.error("Не удалось добавить шрифт:", error);
      toast.add({ title: "Не удалось добавить шрифт", type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteFont = async (selectedName: string) => {
    if (selectedName === "Arial" || isDeleting) return;
    if (!window.confirm(`Удалить шрифт «${selectedName}»?`)) return;

    setIsDeleting(true);
    try {
      await deleteResource("font", selectedName);
      const store = useAppStore.getState();
      if (store.font === selectedName) await store.setSetting("font", "Arial");
      if (store.font_manual === selectedName)
        await store.setSetting("font_manual", "Arial");

      setFont("Arial");
      onPreviewFont(undefined);
      toast.add({ title: "Шрифт удалён", type: "success" });
    } catch (error) {
      console.error("Не удалось удалить шрифт:", error);
      toast.add({ title: "Не удалось удалить шрифт", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-1 text-xs">
      <span className="shrink-0 whitespace-nowrap text-muted-foreground">
        Шрифт
      </span>
      <Select
        value={font}
        onValueChange={setFont}
        onOpenChange={(open) => {
          if (!open) onPreviewFont(undefined);
        }}
      >
        <SelectTrigger className="h-8 w-[140px] max-w-[140px] min-w-0 flex-1 gap-1 px-1.5 text-xs">
          <SelectValue
            className="block min-w-0 flex-1 truncate text-left"
            placeholder="Выберите шрифт"
          />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {dataFonts.map((item) => (
              <SelectItem
                value={item}
                key={item}
                onPointerMove={() => onPreviewFont(item)}
                onFocus={() => onPreviewFont(item)}
                className="text-xs"
              >
                <span className="min-w-0 flex-1 truncate">{item}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        type="button"
        onClick={() => void handleDeleteFont(font)}
        disabled={font === "Arial" || isDeleting}
        title={font === "Arial" ? "Стандартный шрифт нельзя удалить" : `Удалить шрифт «${font}»`}
        aria-label={font === "Arial" ? "Удаление недоступно" : `Удалить шрифт «${font}»`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
      >
        <Trash2 size={14} />
      </Button>

      <Button
        variant="ghost"
        type="button"
        onClick={() => void handleAddFonts()}
        disabled={isAdding}
        title="Добавить шрифт"
        aria-label="Добавить шрифт"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
      >
        <span className="relative inline-flex">
          <Type size={14} />
          <Plus size={8} className="absolute -right-1 -top-1" />
        </span>
      </Button>
    </div>
  );
}
