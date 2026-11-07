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
  listFonts: string[];
}

export default function Font({ font, setFont, listFonts }: FontProps) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-muted-foreground whitespace-nowrap">Шрифт</span>

      <Select value={font} onValueChange={setFont}>
        <SelectTrigger className="w-35 px-1.5 text-xs gap-1">
          <SelectValue placeholder="Выберите шрифт" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {listFonts.map((value) => (
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
