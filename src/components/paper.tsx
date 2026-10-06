// Поле выбора формата бумаги из списка доступных размеров этикетки.
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaperProps {
  defaultPaper: string;
  defaultListPapers: string[];
  setDefaultPaper: (paper: string) => void;
}

export default function Paper({
  defaultPaper,
  defaultListPapers,
  setDefaultPaper,
}: PaperProps) {
  return (
    <div data-tauri-drag-region className="flex min-w-0 flex-col items-start gap-1">
      <span className="text-xs font-medium leading-tight text-muted-foreground">Этикетка (мм)</span>
      <Select defaultValue={defaultPaper} onValueChange={setDefaultPaper}>
        <SelectTrigger className="h-9 w-full rounded-lg px-2.5 text-sm" title="Ширина × высота">
          <SelectValue placeholder="Выберете этикетку" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {defaultListPapers.map((paper) => (
              <SelectItem value={paper} key={paper}>
                {paper}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
