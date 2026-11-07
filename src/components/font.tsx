// Выпадающий список для выбора оформления интерфейса.
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
  console.log(listFonts);

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="font-medium text-muted-foreground">Шрифт</span>
      <Select defaultValue={font} onValueChange={setFont}>
        <SelectTrigger className="h-5 w-full max-w-38 rounded-lg px-2.5 text-xs p-2">
          <SelectValue placeholder="Выберете шрифт" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {listFonts.map((value) => (
              <SelectItem value={value} key={value}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
