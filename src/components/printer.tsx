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
    <div className="flex flex-col items-center">
      <span>Принтер</span>
      <Select defaultValue={defaultPrinter} onValueChange={setDefaultPrinter}>
        <SelectTrigger className="w-full max-w-48">
          <SelectValue placeholder="Выберете принтер" />
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
