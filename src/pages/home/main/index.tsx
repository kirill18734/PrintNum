// Главный экран рабочих режимов: связывает настройки, панели функций и предпросмотр.
import { useAppStore } from "@/services/store";
import ThemeStyle from "@/components/theme-style";
import PipelineStage from "../../../components/PipelineStage";
import PrinterSettings from "./PrinterSettings";
import ModeTabs from "./ModeTabs";
import { useState } from "react";
import { AutoPrint } from "./AutoPrint";
import { Label } from "./Label";
import Printer from "@/components/printer";
import Paper from "@/components/paper";

export default function Main() {
  const [mode, setMode] = useState<"autoprint" | "create">("autoprint");
  //get
  const themeStyle = useAppStore((state) => state.themeStyle);
  const printer = useAppStore((state) => state.printer);
  const paper = useAppStore((state) => state.paper);
  const listPrinters = useAppStore((state) => state.listPrinters);
  const listPapers = useAppStore((state) => state.listPapers);
  const printerOnline = useAppStore((state) => state.printerOnline);

  //change
  const setSetting = useAppStore((state) => state.setSetting);
  const changePrinter = (newPrinter: string) =>
    setSetting("printer", newPrinter);
  const changePaper = (newPaper: string) => setSetting("paper", newPaper);
  const changeThemeStyle = (newThemeStyle: string) =>
    setSetting("themeStyle", newThemeStyle);

  return (
    <main className="flex flex-col flex-1 justify-center">
      <div className="mt-auto flex w-full justify-end pt-1.5">
        <ol className="w-full min-w-0">
          <PipelineStage
            number={1}
            state={printerOnline ? "complete" : "error"}
          >
            <div
              data-tauri-drag-region
              className="flex items-center justify-between gap-2"
            >
              {/* Принтер */}
              <Printer
                defaultPrinter={printer}
                defaultListPrinters={listPrinters}
                setDefaultPrinter={changePrinter}
              />
              {/* Бумага */}
              <Paper
                defaultPaper={paper}
                setDefaultPaper={changePaper}
                defaultListPapers={listPapers}
              />
            </div>
            {/* <PrinterSettings
              printer={printer}
              papers={listPapers}
              printers={listPrinters}
              paper={paper}
              onPrinterChange={changePrinter}
              onPaperChange={changePaper}
              printerOnline={printerOnline}
            /> */}
          </PipelineStage>

          {/* Этап 2: контейнер без заголовка с двумя вкладками */}
          <PipelineStage number={2} title="" state="idle">
            <ModeTabs mode={mode} onModeChange={setMode} />
            {mode == "autoprint" ? <AutoPrint /> : <Label />}
          </PipelineStage>
          <PipelineStage
            number={3}
            title="Результат"
            state={"complete"}
            last={true}
          ></PipelineStage>
        </ol>
      </div>
      <ThemeStyle
        defaultThemeStyle={themeStyle}
        setDefaultThemeStyle={changeThemeStyle}
      />
    </main>
  );
}
// Главный экран рабочих режимов: связывает настройки, панели функций и предпросмотр.
