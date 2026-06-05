import { useEffect } from "react";
import Hide from "./hide";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StatusPrinting from "./statusPrinting";
import Autoscript from "./autoscript";
import QrCommands from "./qrCommands";
import Help from "./Help";

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
        className="w-full bg-card text-card-foreground shadow-sm overflow-hidden  border"
      >
        <AccordionItem value="dop-menu" className="border-b-0">
          <AccordionTrigger className="p-3 text-sm font-semibold hover:no-underline hover:bg-muted/50 transition-colors">
            Дополнительные возможности
          </AccordionTrigger>
          {/* Убрали лишний внутренний div, перенеся центрирование сюда */}
          <AccordionContent className="p-3 pt-0 flex flex-col items-center gap-2">
            <div className="flex flex-col items-center p-2 w-full gap-2">
              <QrCommands />
              <Autoscript />
              <Hide />
              <Help />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default App;
