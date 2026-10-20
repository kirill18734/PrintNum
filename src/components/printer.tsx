// Поле выбора принтера из списка устройств, обнаруженных backend.
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrinterProps {
  defaultPrinter: string;
  setDefaultPrinter: (printer: string) => void;
  defaultListPrinters: string[];
}

export default function Printer({
  defaultPrinter,
  setDefaultPrinter,
  defaultListPrinters,
}: PrinterProps) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <span className="text-xs font-medium leading-tight text-muted-foreground">Принтер</span>
      <Select defaultValue={defaultPrinter} onValueChange={setDefaultPrinter}>
        <SelectTrigger className="h-9 w-full rounded-lg px-2.5 text-sm">
          <SelectValue placeholder="Выберите принтер" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {defaultListPrinters.map((printer) => (
              <SelectItem value={printer} key={printer}>
                {printer}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
