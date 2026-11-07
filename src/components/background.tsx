import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface BackgroundProps {
  background: string;
  setBackground: (background: string) => void;
  listBackgrounds: string[];
}

export default function Background({
  background,
  setBackground,
  listBackgrounds,
}: BackgroundProps) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-muted-foreground whitespace-nowrap">Фон</span>

      <Select value={background} onValueChange={setBackground}>
        <SelectTrigger className="w-35 px-1.5 text-xs gap-1">
          <SelectValue placeholder="Выберите фон" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {listBackgrounds.map((value) => (
              <SelectItem value={value} key={value} className="text-xs">
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
