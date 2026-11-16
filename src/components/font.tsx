import { useState } from "react";
import type { FontItem } from "@/types/api";
import { FilePlus2, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { addResourceFiles, deleteResource } from "@/services/resourceManager.tauri";
import { refreshFonts } from "@/services/resources.tauri";
import { useAppStore } from "@/services/store";
import { useToast } from "./ui/toast";

interface FontProps {
  font: string;
  setFont: (font: string) => void;
  dataFonts: FontItem[];
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
      await refreshFonts();
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
    const selected = dataFonts.find((item) => item.name === font && item.name !== "Arial");
    if (!selected || isDeleting) return;
    if (!window.confirm(`Удалить шрифт «${selected.name}»?`)) return;

    setIsDeleting(true);
    try {
      const { BaseDirectory, readDir } = await import("@tauri-apps/plugin-fs");
      const entries = await readDir("fonts", { baseDir: BaseDirectory.AppData });
      const exactName = entries.find((entry) =>
        !entry.isDirectory && entry.name.startsWith(`${selected.name}.`),
      )?.name;
      if (!exactName) throw new Error("Файл шрифта не найден");

      await deleteResource("font", exactName);
      const store = useAppStore.getState();
      if (store.font === selected.name) await store.setSetting("font", "Arial");
      if (store.font_manual === selected.name) await store.setSetting("font_manual", "Arial");
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
                value={item.name}
                key={item.id}
                onPointerMove={() => onPreviewFont(item.family || item.name)}
                onFocus={() => onPreviewFont(item.family || item.name)}
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
        onClick={() => void handleAddFonts()}
        disabled={isAdding}
        title="Добавить шрифт"
        aria-label="Добавить шрифт"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
      >
        <FilePlus2 size={14} />
      </button>
      <button
        type="button"
        onClick={() => void handleDeleteFont()}
        disabled={!dataFonts.some((item) => item.name === font && item.name !== "Arial") || isDeleting}
        title="Удалить выбранный шрифт"
        aria-label="Удалить выбранный шрифт"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-1.5 outline-none transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
