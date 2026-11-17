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
  const printerOnline = useAppStore((state) => state.printerOnline);
  const backendOnline = useAppStore((state) => state.serverOnline);
  const font = useAppStore((state) => state.font);
  const fontManual = useAppStore((state) => state.font_manual);
  const background = useAppStore((state) => state.background);
  const backgroundManual = useAppStore((state) => state.background_manual);
  const dataFonts = useAppStore((state) => state.dataFonts);
  const dataBackgrounds = useAppStore((state) => state.dataBackgrounds);
  const listPrinters = useAppStore((state) => state.listPrinters);
  const listPapers = useAppStore((state) => state.listPapers);

  // Значения из конфига должны оставаться доступными в Select,
  // даже если backend ещё не ответил или ресурс отсутствует в его списке.
  const fontOptions = [...new Set([font, fontManual, "Arial", ...dataFonts].filter(Boolean))];
  const backgroundOptions = [
    ...new Set([background, backgroundManual, ...dataBackgrounds].filter(
      (value) => Boolean(value) && value !== "Без фона",
    )),
  ];
  const printerOptions = printer
    ? [printer, ...listPrinters.filter((item) => item !== printer)]
    : listPrinters;

  const setSetting = useAppStore((state) => state.setSetting);

  const setPrinter = (newPrinter: string) => setSetting("printer", newPrinter);
  const setPaper = (newPaper: string) => setSetting("paper", newPaper);
  const setThemeStyle = (newThemeStyle: string) =>
    setSetting("themeStyle", newThemeStyle);

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto p-1 md:p-6 flex flex-col gap-2">
      <div className="flex w-full flex-col">
        <SectionNavigation
          activeSection={section}
          onSectionChange={setSection}
          printerOnline={backendOnline && printerOnline}
        />

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
              listPrinters={printerOptions}
              setPrinter={setPrinter}
              paper={paper}
              setPaper={setPaper}
              listPapers={listPapers}
              dataFonts={fontOptions}
              dataBackgrounds={backgroundOptions}
              backendOnline={backendOnline}
              printerOnline={printerOnline}
            />
          ) : (
            <CreateLabel
              printer={printer}
              listPrinters={printerOptions}
              setPrinter={setPrinter}
              paper={paper}
              setPaper={setPaper}
              listPapers={listPapers}
              dataFonts={fontOptions}
              dataBackgrounds={backgroundOptions}
              backendOnline={backendOnline}
              printerOnline={printerOnline}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-end">
        <ThemeStyle
          defaultThemeStyle={themeStyle}
          setDefaultThemeStyle={setThemeStyle}
        />
      </div>
    </main>
  );
}
