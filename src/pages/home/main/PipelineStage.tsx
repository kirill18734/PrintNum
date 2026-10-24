import type { ReactNode } from "react";
import { Check, CircleAlert, LoaderCircle, Minus, Radio } from "lucide-react";

// 1. Четко определяем возможные статусы для безопасности TypeScript
type StageState =
  | "idle"
  | "pending"
  | "complete"
  | "skipped"
  | "blocked"
  | "error";

const styles: Record<StageState, string> = {
  idle: "border-border bg-card",
  pending: "border-sky-500/30 bg-sky-500/[0.05]",
  complete: "border-green-500/30 bg-green-500/[0.05]",
  skipped: "border-amber-500/30 bg-amber-500/[0.05]",
  blocked: "border-amber-500/30 bg-amber-500/[0.05]",
  error: "border-red-500/60 bg-red-500/15",
};

// Отдельные стили для текста внутри круглой иконки, чтобы не смешивать с блоком
const iconStyles: Record<StageState, string> = {
  idle: "text-muted-foreground border-border bg-card",
  pending: "text-sky-700 dark:text-sky-300 border-sky-500/30 bg-sky-500/[0.05]",
  complete:
    "text-green-700 dark:text-green-300 border-green-500/30 bg-green-500/[0.05]",
  skipped:
    "text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-500/[0.05]",
  blocked:
    "text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-500/[0.05]",
  error: "text-red-800 dark:text-red-200 border-red-500/60 bg-red-500/15",
};

interface PipelineStageProps {
  number: number;
  title?: string;
  description?: string;
  state: StageState; // Заменили string на StageState
  message?: string; // Вынесли message в отдельный проп
  waiting?: boolean;
  last?: boolean;
  children?: ReactNode;
}

export default function PipelineStage({
  number,
  title,
  description,
  state = "idle",
  message,
  waiting,
  last,
  children,
}: PipelineStageProps) {
  // Безопасный фолбек, если придет неизвестная строка
  const currentStyle = styles[state] || styles.idle;
  const currentIconStyle = iconStyles[state] || iconStyles.idle;

  const Icon =
    state === "complete"
      ? Check
      : state === "error" || state === "blocked"
        ? CircleAlert
        : state === "skipped"
          ? Minus
          : state === "pending"
            ? LoaderCircle
            : waiting
              ? Radio
              : null;

  return (
    <li
      data-stage={number}
      data-status={state}
      className="relative min-w-0 pb-2 pl-8 last:pb-0 list-none"
    >
      {/* Линия-соединитель */}
      {!last && (
        <span
          aria-hidden="true"
          className={`absolute top-7 bottom-0 left-3 w-px transition-colors ${state === "complete" ? "bg-green-500/40" : "bg-border"}`}
        />
      )}

      {/* Кружок со статусом/номером */}
      <span
        aria-hidden="true"
        className={`absolute top-2 left-0 flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors ${currentIconStyle}`}
      >
        {Icon ? (
          <Icon
            className={`size-3.5 ${state === "pending" ? "animate-spin motion-reduce:animate-none" : waiting ? "animate-pulse motion-reduce:animate-none" : ""}`}
          />
        ) : (
          number
        )}
      </span>

      {/* Оборачиваемый блок контента */}
      <section
        className={`min-w-0 rounded-xl border p-2.5 transition-colors duration-300 ${currentStyle}`}
      >
        {title && (
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        )}
        {description && (
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {description}
          </p>
        )}
        {/* Исправленная проверка сообщения */}
        {message && message.trim().length > 0 && (
          <p
            role="status"
            className="mt-0.5 text-xs leading-snug text-muted-foreground"
          >
            {message}
          </p>
        )}
        {children && <div className="min-w-0 text-foreground">{children}</div>}
      </section>
    </li>
  );
}
