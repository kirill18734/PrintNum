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
          title:           result.skipped > 0
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
    <div className="flex items-center gap-1 text-xs">
      <span className="whitespace-nowrap text-muted-foreground">Шрифт</span>
      <Select
        value={font}
        onValueChange={setFont}
        onOpenChange={(open) => {
          if (!open) onPreviewFont(undefined);
        }}
      >
        <SelectTrigger className="w-35 min-w-0 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:overflow-hidden [&_[data-slot=select-value]]:text-ellipsis [&_[data-slot=select-value]]:whitespace-nowrap gap-1 px-1.5 text-xs">
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
                className="pr-14 text-xs"
              >
                <span className="min-w-0 flex-1 whitespace-normal break-all">{item}</span>
                {item !== "Arial" && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    title={`Удалить шрифт «${item}»`}
                    aria-label={`Удалить шрифт «${item}»`}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleDeleteFont(item);
                    }}
                    className="absolute right-7 z-10 flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
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

    </div>
  );
}
