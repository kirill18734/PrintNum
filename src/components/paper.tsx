import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Paper({ paper, listPapers }: any) {
  return (
    <div data-tauri-drag-region className="flex flex-col items-center">
      <span>Этикетка (mm)</span>
      <Select defaultValue={paper}>
        <SelectTrigger className="w-full max-w-48" title="Ширина*Высота">
          <SelectValue placeholder="Выберете этикетку" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {listPapers.map((paper: string, i: number) => (
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
