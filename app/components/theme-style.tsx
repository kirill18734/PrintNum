import { THEMES_STYLE } from "@/config/theme-style";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useFetcher } from "react-router";

export default function ThemeStyle({ defaultThemeStyle }) {
  const fetcher = useFetcher();

  const sendChange = (e) => {
    fetcher.submit(
      { themeStyle: e },
      { method: "post", action: "/action/set-theme-style" },
    );
  };

  return (
    <Select defaultValue={defaultThemeStyle} onValueChange={sendChange}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder="Theme Style" />
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
  );
}
