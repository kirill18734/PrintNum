import { useState } from "react";
import { Plus, Trash2, Type } from "lucide-react";
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
import { useToast } from "./ui/toast";

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
  const { showToast } = useToast();

  const handleAddFonts = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const result = await addResourceFiles("font");
      if (result.added > 0) showToast("Шрифт добавлен", "success");
      if (result.skipped > 0) showToast("Файл уже существует", "warning");
    } catch (error) {
      console.error("Не удалось добавить шрифт:", error);
      showToast("Не удалось добавить шрифт", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteFont = async () => {
    const selectedName = dataFonts.find(
      (item) => item === font && item !== "Arial",
    );
    if (!selectedName || isDeleting) return;
    if (!window.confirm(`Удалить шрифт «${selectedName}»?`)) return;

    setIsDeleting(true);
    try {
      await deleteResource("font", selectedName);
      const store = useAppStore.getState();
      if (store.font === selectedName) await store.setSetting("font", "Arial");
      if (store.font_manual === selectedName)
        await store.setSetting("font_manual", "Arial");
      await refreshFonts();
      onPreviewFont(undefined);
      showToast("Шрифт удалён", "success");
    } catch (error) {
      console.error("Не удалось удалить шрифт:", error);
      showToast("Не удалось удалить шрифт", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="whitespace-nowrap text-muted-foreground">Шрифт</span>
      <Select
        value={font}
        onValueChange={setFont}
        onOpenChange={(open) => {
          if (!open) onPreviewFont(undefined);
        }}
      >
        <SelectTrigger className="w-35 gap-1 px-1.5 text-xs">
          <SelectValue placeholder="Выберите шрифт" />
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
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <button
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
      </button>
      <button
        type="button"
        onClick={() => void handleDeleteFont()}
        disabled={
          !dataFonts.some((item) => item === font && item !== "Arial") ||
          isDeleting
        }
        title="Удалить выбранный шрифт"
        aria-label="Удалить выбранный шрифт"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 outline-none transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
