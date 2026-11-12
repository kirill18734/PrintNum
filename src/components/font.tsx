import type { FontItem } from "@/types/api";

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
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-muted-foreground whitespace-nowrap">Шрифт</span>

      <Select
        value={font}
        onValueChange={setFont}
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
            {dataFonts.map((item) => (
              <SelectItem
                value={item.name}
                key={item.name}
                onPointerMove={() => onPreviewFont(item.name)}
                onFocus={() => onPreviewFont(item.name)}
                className="text-xs"
              >
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
