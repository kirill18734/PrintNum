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
  const listPapers = useAppStore((state) => state.listPapers);

  const setSetting = useAppStore((state) => state.setSetting);
  const setPrinter = (newPrinter: string) => setSetting("printer", newPrinter);
  const setPaper = (newPaper: string) => setSetting("paper", newPaper);
  const setThemeStyle = (newThemeStyle: string) =>
    setSetting("themeStyle", newThemeStyle);

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Навигация с передачей состояния */}
      <SectionNavigation activeSection={section} onSectionChange={setSection} />

      {/* Контент вкладки Автопечать */}
      {section === "auto-print" ? (
        <AutoPrint
          printer={printer}
          listPrinters={listPrinters}
          setPrinter={setPrinter}
          paper={paper}
          setPaper={setPaper}
          listPapers={listPapers}
        />
      ) : (
        <CreateLabel />
      )}
      <div className="flex items-center justify-end">
        <ThemeStyle
          defaultThemeStyle={themeStyle}
          setDefaultThemeStyle={setThemeStyle}
        />
      </div>
    </main>
  );
}
