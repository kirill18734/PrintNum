import { THEMES_STYLE } from "@/config/theme-style";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function ThemeStyle({ themeStyle }: any) {
  return (
    <div className="flex  items-center gap-2">
      <span>Стиль</span>
      <Select defaultValue={themeStyle}>
        <SelectTrigger className="w-full max-w-48">
          <SelectValue placeholder="Стиль темы" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {THEMES_STYLE.map((item) => (
              <SelectItem value={item.value} key={item.value}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
