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
    <div data-tauri-drag-region className="flex flex-col items-center">
      <span>Этикетка (mm)</span>
      <Select defaultValue={defaultPaper} onValueChange={setDefaultPaper}>
        <SelectTrigger className="w-full max-w-48" title="Ширина*Высота">
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
