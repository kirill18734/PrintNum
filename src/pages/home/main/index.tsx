import { useState } from "react";
import { useAppStore } from "@/services/store";
import {
  SectionNavigation,
  type AppSection,
} from "@/components/sectionNavigation";
import AutoPrint from "./autoPrint";
import CreateLabel from "./createLabel";
import ThemeStyle from "@/components/theme-style";

export default function Main() {
  const [section, setSection] = useState<AppSection>("auto-print");

  const themeStyle = useAppStore((state) => state.themeStyle);
  const paper = useAppStore((state) => state.paper);
  const printer = useAppStore((state) => state.printer);
  const listPrinters = useAppStore((state) => state.listPrinters);
  const dataFonts = useAppStore((state) => state.dataFonts);
  const listPapers = useAppStore((state) => state.listPapers);
  const dataBackgrounds = useAppStore((state) => state.dataBackgrounds);
  const background = useAppStore((state) => state.background);

  const setSetting = useAppStore((state) => state.setSetting);

  const setPrinter = (newPrinter: string) => setSetting("printer", newPrinter);
  const setPaper = (newPaper: string) => setSetting("paper", newPaper);
  const setThemeStyle = (newThemeStyle: string) =>
    setSetting("themeStyle", newThemeStyle);
  const setBackground = (value: string) => setSetting("background", value);

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto p-1 md:p-6 flex flex-col gap-2">
      {/* Навигация и рабочая область */}
      <div className="flex w-full flex-col">
        <SectionNavigation
          activeSection={section}
          onSectionChange={setSection}
        />

        {/* Рабочая область объединена с активной вкладкой */}
        <div
          className={`
            min-w-0 border border-border/60 border-t-0 bg-card p-2
            ${
              section === "auto-print"
                ? "rounded-b-xl rounded-tr-xl"
                : "rounded-b-xl rounded-tl-xl"
            }
          `}
        >
          {section === "auto-print" ? (
            <AutoPrint
              printer={printer}
              listPrinters={listPrinters}
              setPrinter={setPrinter}
              paper={paper}
              setPaper={setPaper}
              listPapers={listPapers}
              background={background}
              setBackground={setBackground}
              dataFonts={dataFonts}
              dataBackgrounds={dataBackgrounds}
            />
          ) : (
            <CreateLabel
              printer={printer}
              listPrinters={listPrinters}
              setPrinter={setPrinter}
              paper={paper}
              setPaper={setPaper}
              listPapers={listPapers}
              dataFonts={dataFonts}
              dataBackgrounds={dataBackgrounds}
            />
          )}
        </div>
      </div>

      {/* Выбор стиля остаётся на прежнем месте */}
      <div className="flex items-center justify-end">
        <ThemeStyle
          defaultThemeStyle={themeStyle}
          setDefaultThemeStyle={setThemeStyle}
        />
      </div>
    </main>
  );
}
