import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Printer({
  defaultPrinter,
  setDefaultPrinter,
  defaultListPrinters,
}: any) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <span className="text-xs font-medium leading-tight text-muted-foreground">Принтер</span>
      <Select defaultValue={defaultPrinter} onValueChange={setDefaultPrinter}>
        <SelectTrigger className="h-9 w-full rounded-lg px-2.5 text-sm">
          <SelectValue placeholder="Выберите принтер" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {defaultListPrinters.map((printer: string, i: number) => (
              <SelectItem value={printer} key={i}>
                {printer}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
