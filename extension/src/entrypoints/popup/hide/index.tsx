import Menu from "./menu";
import Returns from "./returns";
import Notification from "./notifications";
import { Accordion } from "@/components/ui/accordion";
import { Eye } from "lucide-react";
import Other from "./other";

export default function Hide() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Красивая шапка категории вместо первого аккордеона */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2 select-none">
        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
        <span className="text-sm font-bold tracking-tight">
          Настройки видимости
        </span>
      </div>

      {/* ОДИН уровень аккордеона. Секции открываются сразу внутри карточки */}
      <Accordion
        type="single"
        collapsible
        className="w-full divide-y divide-border"
      >
        <Menu />
        <Notification />
        <Returns />
        <Other />
      </Accordion>
    </div>
  );
}
