import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsPrinterProps {
  printer: string;
  listPrinters: string[];
  setPrinter: (printer: string) => void;
  paper: string;
  listPapers: string[];
  setPaper: (paper: string) => void;
  printerOnline: boolean; // Изменено Boolean на boolean (лучшая практика для TS)
}

export default function SettingsPrinter({
  printer,
  listPrinters,
  setPrinter,
  paper,
  listPapers,
  setPaper,
  printerOnline,
}: SettingsPrinterProps) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      {/* Поле выбора принтера */}
      <div className="flex flex-1 min-w-0 flex-col items-start gap-0.5">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-[11px] font-medium text-muted-foreground">
            Принтер
          </span>
          {!printerOnline && (
            <span className="text-[11px] font-medium text-destructive">
              НЕДОСТУПЕН
            </span>
          )}
        </div>
        <Select defaultValue={printer} onValueChange={setPrinter}>
          <SelectTrigger
            className={`h-8 w-full rounded-md px-2 text-xs transition-colors ${
              !printerOnline
                ? "border-destructive text-destructive focus:ring-destructive"
                : ""
            }`}
          >
            <SelectValue placeholder="Выберите принтер" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {listPrinters.map((item) => (
                <SelectItem value={item} key={item} className="text-xs">
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Поле выбора формата бумаги */}
      <div
        data-tauri-drag-region
        className="flex flex-1 min-w-0 flex-col items-start gap-0.5"
      >
        <span className="text-[11px] font-medium leading-none text-muted-foreground">
          Этикетка (мм)
        </span>
        <Select defaultValue={paper} onValueChange={setPaper}>
          <SelectTrigger
            className="h-8 w-full rounded-md px-2 text-xs"
            title="Ширина × высота"
          >
            <SelectValue placeholder="Выберите этикетку" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {listPapers.map((item) => (
                <SelectItem value={item} key={item} className="text-xs">
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
