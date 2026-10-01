import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StatusPrinting from "./statusPrinting";
import QrCommands from "./qrCommands";
import { Github, Send } from "lucide-react";

function App() {
  useEffect(() => {
    const body = document.documentElement;
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    body.classList.toggle("dark", isDark);
  }, []);

  return (
    <div className="flex flex-col w-80 items-center gap-4">
      <StatusPrinting />

      <Accordion
        type="single"
        collapsible
        className="w-full bg-card text-card-foreground shadow-sm overflow-hidden border"
      >
        <AccordionItem value="dop-menu" className="border-b-0">
          <AccordionTrigger className="p-3 text-sm font-semibold hover:no-underline hover:bg-muted/50 transition-colors">
            Дополнительные возможности
          </AccordionTrigger>
          <AccordionContent className="p-3 pt-0 flex flex-col items-center gap-2">
            <div className="flex flex-col items-center p-2 w-full gap-2">
              <QrCommands />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Нижняя панель с кнопками. Добавлены боковые отступы px-4, чтобы не прижиматься к краям */}
      <div className="grid grid-cols-2 gap-2.5 w-full px-4 pt-1 pb-2">
        {/* Кнопка Telegram (Кастомный нео-модерн стиль) */}
        <a
          href="https://t.me/printnum"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center justify-center gap-2 h-9 rounded-xl text-[11px] font-medium transition-all duration-300 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-sky-500/20 bg-gradient-to-b from-sky-500/5 to-sky-500/[0.12] text-sky-600 dark:text-sky-400 hover:from-sky-500 hover:to-sky-600 hover:text-white dark:hover:text-white shadow-sm shadow-sky-500/[0.03] active:scale-[0.97]"
          title="Поддержка в Telegram"
        >
          <Send className="w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />

          <div className="relative h-4 w-20 overflow-hidden">
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out transform group-hover:-translate-y-full group-hover:opacity-0">
              Поддержка
            </span>
            <span className="absolute inset-0 flex items-center justify-center font-semibold transition-all duration-300 ease-in-out transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
              @printnum
            </span>
          </div>
        </a>

        {/* Кнопка GitHub (Кастомный нео-модерн стиль) */}
        <a
          href="https://github.com/kirill18734/PrintNum/tree/main/extension"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 h-9 rounded-xl text-[11px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-50 to-neutral-100/80 dark:from-neutral-900 dark:to-neutral-950 text-neutral-700 dark:text-neutral-300 hover:from-neutral-100 hover:to-neutral-200 dark:hover:from-neutral-800 dark:hover:to-neutral-900 shadow-sm active:scale-[0.97]"
        >
          <Github className="w-3.5 h-3.5 shrink-0 text-neutral-500 dark:text-neutral-400" />
          <span className="truncate">Документация</span>
        </a>
      </div>
    </div>
  );
}

export default App;
