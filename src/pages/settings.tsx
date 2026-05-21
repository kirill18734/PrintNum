import Paper from "@/components/paper";
import Printer from "@/components/printer";
import ShowPaper from "@/components/showPaper";
import Theme from "@/components/theme";
import ThemeStyle from "@/components/theme-style";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/context/AppProvider";
import { useSettingsContext } from "@/context/SettingsProvider";
import { useThemeContext } from "@/context/ThemeProvider";
import { useThemeStyleContext } from "@/context/ThemeStyleProvider";

export default function Settings() {
  const {
    printer,
    setPrinter,
    listPrinters,
    paper,
    setPaper,
    listPapers,
    idNum,
    setIdNum,
    endLine,
    setEndLine,
    hybrid,
    setHybrid,
    expand,
    setExpand,
  }: any = useSettingsContext();

  const { theme, setTheme } = useThemeContext();
  const { themeStyle, setThemeStyle } = useThemeStyleContext();
  const { getVersion } = useAppContext();
  const version = getVersion();

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
        <Printer
          defaultPrinter={printer}
          defaultListPrinters={listPrinters}
          setDefaultPrinter={setPrinter}
        />
        {/* Бумага */}
        <Paper
          defaultPaper={paper}
          setDefaultPaper={setPaper}
          defaultListPapers={listPapers}
        />
      </div>
      <Separator />
      <ShowPaper
        defaultIdNum={idNum}
        setDefaultIdNum={setIdNum}
        defaultEndLine={endLine}
        setDefaultEndLine={setEndLine}
        defaultHybrid={hybrid}
        setDefaultHybrid={setHybrid}
        defaultExpand={expand}
        setDefaultExpand={setExpand}
      />
      <Separator />
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        <Theme defaultTheme={theme} setDefaultTheme={setTheme} />
        <ThemeStyle
          defaultThemeStyle={themeStyle}
          setDefaultThemeStyle={setThemeStyle}
        />
      </div>
      <div data-tauri-drag-region className="flex items-center justify-center">
        v{version}
      </div>
    </div>
  );
}
