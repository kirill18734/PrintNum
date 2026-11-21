import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Paper from "./paper";
import type { PaperFormat } from "@/config/defaultConfig";

interface SettingsPrinterProps {
  printer: string;
  listPrinters: string[];
  setPrinter: (printer: string) => void;
  paper: string;
  listPapers: PaperFormat[];
  setPaper: (paper: string) => void;
  backendOnline: boolean;
  printerOnline: boolean;
}

export default function SettingsPrinter({
  printer,
  listPrinters,
  setPrinter,
  paper,
  listPapers,
  setPaper,
  backendOnline,
  printerOnline,
}: SettingsPrinterProps) {
  // Текущий принтер из конфига остаётся видимым, даже если backend
  // ещё не прислал список или выбранного принтера в нём нет.
  const printerOptions = printer
    ? [printer, ...listPrinters.filter((item) => item !== printer)]
    : listPrinters;

  return (
    <div className="flex w-full items-start justify-between gap-3">
      <div className="flex flex-1 min-w-0 flex-col items-start gap-0.5">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-[11px] font-medium text-muted-foreground">
            Принтер
          </span>
          {backendOnline && !printerOnline && (
            <span className="text-[11px] font-medium text-destructive">
              НЕДОСТУПЕН
            </span>
          )}
        </div>
        <Select
          value={printer}
          onValueChange={setPrinter}
          disabled={!backendOnline}
        >
          <SelectTrigger
            className={`h-8 w-full rounded-md px-2 text-xs transition-colors ${
              backendOnline && !printerOnline
                ? "border-destructive text-destructive focus:ring-destructive"
                : ""
            }`}
          >
            <SelectValue
              placeholder={backendOnline ? "Выберите принтер" : "Ожидание backend..."}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {printerOptions.map((item) => (
                <SelectItem value={item} key={item} className="text-xs">
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Paper paper={paper} listPapers={listPapers} setPaper={setPaper} />
    </div>
  );
}
