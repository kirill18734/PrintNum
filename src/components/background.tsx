import { ImagePlus } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { appService } from "@/services/app.tauri";

interface BackgroundProps {
  background: string;
  setBackground: (background: string) => void;
  dataBackgrounds: any;
}

export default function Background({
  background,
  setBackground,
  dataBackgrounds,
}: BackgroundProps) {
  return (
    <div className="flex items-center gap-1 text-xs gap-5">
      <span className="text-muted-foreground whitespace-nowrap">Фон</span>
      <div className="flex items-center justify-center gap-1">
        <Select value={background} onValueChange={setBackground}>
          <SelectTrigger className="w-35 px-1.5 text-xs gap-1">
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
  );
}
