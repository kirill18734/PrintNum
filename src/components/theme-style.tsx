import { THEMES_STYLE } from "@/config/theme-style";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function ThemeStyle({
  defaultThemeStyle,
  setDefaultThemeStyle,
}: any) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-xs">
      <span className="font-medium text-muted-foreground">Стиль</span>
      <Select
        defaultValue={defaultThemeStyle}
        onValueChange={setDefaultThemeStyle}
      >
        <SelectTrigger className="h-9 w-full max-w-48 rounded-lg px-2.5 text-sm">
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
