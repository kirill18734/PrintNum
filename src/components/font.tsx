import { useEffect } from "react";
import type { FontItem } from "@/types/api";
import { loadFontFamily } from "@/shared/utils/fontStyles";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
  useEffect(() => {
    if (font) void loadFontFamily(dataFonts, font).catch((error) => console.error("Не удалось загрузить шрифт:", error));
  }, [font, dataFonts]);

  const handlePreview = (family: string | undefined) => {
    if (family) void loadFontFamily(dataFonts, family).catch((error) => console.error("Не удалось загрузить шрифт:", error));
    onPreviewFont(family);
  };

  const handleSelect = (family: string) => {
    void loadFontFamily(dataFonts, family).catch((error) => console.error("Не удалось загрузить шрифт:", error));
    setFont(family);
  };

  // Несколько файлов Regular/Bold/Italic одного семейства — один пункт выбора.
  const fontFamilies = Array.from(
    new Set(
      dataFonts
        .map((item) => item.family?.trim() || item.name.trim())
        .filter(Boolean),
    ),
  );

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-muted-foreground whitespace-nowrap">Шрифт</span>

      <Select
        value={font}
        onValueChange={handleSelect}
        onOpenChange={(open) => {
          if (!open) {
            onPreviewFont(undefined);
          }
        }}
      >
        <SelectTrigger className="w-35 px-1.5 text-xs gap-1">
          <SelectValue placeholder="Выберите шрифт" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {fontFamilies.map((family) => (
              <SelectItem
                value={family}
                key={family}
                onPointerMove={() => handlePreview(family)}
                onFocus={() => handlePreview(family)}
                className="text-xs"
              >
                {family}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
