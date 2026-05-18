import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Theme, useTheme } from "remix-themes";

export default function ThemeSelect() {
  const [theme, setTheme, { definedBy }] = useTheme();

  return (
    <Select
      defaultValue={definedBy === "SYSTEM" ? "system" : (theme ?? "")}
      onValueChange={(value) => {
        if (value === "system") {
          setTheme(null);
        } else {
          setTheme(value as Theme);
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={Theme.LIGHT}>Light</SelectItem>
          <SelectItem value={Theme.DARK}>Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
