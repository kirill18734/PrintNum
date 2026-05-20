import { useAppContext } from "@/AppContext";
import Paper from "@/components/paper";
import Printer from "@/components/printer";
import ShowPaper from "@/components/showPaper";
import ThemeSelect from "@/components/theme";
import Theme from "@/components/theme";
import ThemeStyle from "@/components/theme-style";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const {
    printer,
    listPrinters,
    paper,
    listPapers,
    idNum,
    endLine,
    hybrid,
    expand,
    theme,
    themeStyle,
  }: any = useAppContext();

  return (
    <div
      data-tauri-drag-region
      className=" flex-1 flex flex-col justify-between h-full gap-2"
    >
      <span data-tauri-drag-region className="text-center text-blue-600 mt-2">
        OZON
      </span>
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        {/* Принтер */}
        <Printer printer={printer} listPrinters={listPrinters} />
        {/* Бумага */}
        <Paper paper={paper} listPapers={listPapers} />
      </div>
      <Separator />
      <ShowPaper
        idNum={idNum}
        endLine={endLine}
        hybrid={hybrid}
        expand={expand}
      />
      <Separator />
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        <Theme defaultTheme={theme} />
        <ThemeStyle themeStyle={themeStyle} />
      </div>
    </div>
  );
}
