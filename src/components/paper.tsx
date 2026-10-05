import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Paper({
  defaultPaper,
  defaultListPapers,
  setDefaultPaper,
}: any) {
  return (
    <div data-tauri-drag-region className="flex min-w-0 flex-col items-start gap-1">
      <span className="text-xs font-medium leading-tight text-muted-foreground">Этикетка (мм)</span>
      <Select defaultValue={defaultPaper} onValueChange={setDefaultPaper}>
        <SelectTrigger className="h-9 w-full rounded-lg px-2.5 text-sm" title="Ширина × высота">
          <SelectValue placeholder="Выберете этикетку" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {defaultListPapers.map((paper: string, i: number) => (
              <SelectItem value={paper} key={i}>
                {paper}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
