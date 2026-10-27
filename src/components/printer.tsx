// Поле выбора принтера из списка устройств, обнаруженных backend.
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer as PrinterIcon } from "lucide-react";

interface PrinterProps {
  defaultPrinter: string;
  setDefaultPrinter: (printer: string) => void;
  defaultListPrinters: string[];
  online?: boolean;
}

export default function Printer({
  defaultPrinter,
  setDefaultPrinter,
  defaultListPrinters,
  online,
}: PrinterProps) {
  const showUnavailable = online === false;
  const showReady = online === true;
  return (
    <div className="flex w-full flex-col items-start gap-1">
      <div className="flex items-center gap-1.5 text-xs font-medium leading-tight text-muted-foreground">
        <PrinterIcon className="size-3.5" aria-hidden="true" />
        <span>Принтер</span>
        {showReady && (
          <span className="ml-1 font-semibold uppercase text-green-600 dark:text-green-300">
            ГОТОВ
          </span>
        )}
        {showUnavailable && (
          <span className="ml-1 font-semibold uppercase text-red-600 dark:text-red-300">
            НЕДОСТУПЕН
          </span>
        )}
      </div>
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
