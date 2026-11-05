import {
  CheckCircle2,
  LoaderCircle,
  Ban,
  Printer,
  AlertCircle,
  Clock,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type LatestTextStatus =
  | "waiting"
  | "processing"
  | "printed"
  | "excluded"
  | "printer_unavailable"
  | "print_error";

export interface LatestTextCardProps {
  status: LatestTextStatus;
  text?: string | null;
  renameText?: string | null;
  message?: string;
  receivedAt?: Date | string | null;
  className?: string;
}

const STATUS_CONFIG = {
  waiting: {
    title: "Ожидание заданий",
    badge: "Ожидание",
    border: "border-border",
    text: "text-muted-foreground",
    badgeStyle: "bg-muted text-muted-foreground",
    Icon: Clock,
  },
  processing: {
    title: "Обработка задания",
    badge: "В процессе",
    border: "border-blue-500/40 bg-blue-50/5 dark:bg-blue-950/10",
    text: "text-blue-600 dark:text-blue-400",
    badgeStyle: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    Icon: LoaderCircle,
  },
  printed: {
    title: "Успешно напечатан",
    badge: "Готово",
    border: "border-emerald-500/40 bg-emerald-50/5 dark:bg-emerald-950/10",
    text: "text-emerald-600 dark:text-emerald-400",
    badgeStyle:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
  excluded: {
    title: "Задание пропущено",
    badge: "Исключение",
    border: "border-amber-500/40 bg-amber-50/5 dark:bg-amber-950/10",
    text: "text-amber-600 dark:text-amber-400",
    badgeStyle:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    Icon: Ban,
  },
  printer_unavailable: {
    title: "Принтер недоступен",
    badge: "Нет принтера",
    border: "border-destructive/40 bg-destructive/5",
    text: "text-destructive",
    badgeStyle: "bg-destructive/10 text-destructive",
    Icon: Printer,
  },
  print_error: {
    title: "Ошибка печати",
    badge: "Ошибка",
    border: "border-destructive/40 bg-destructive/5",
    text: "text-destructive",
    badgeStyle: "bg-destructive/10 text-destructive",
    Icon: AlertCircle,
  },
} satisfies Record<
  LatestTextStatus,
  {
    title: string;
    badge: string;
    border: string;
    text: string;
    badgeStyle: string;
    Icon: React.ElementType;
  }
>;

function formatTime(value?: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LatestTextCard({
  status,
  text,
  renameText,
  message,
  receivedAt,
  className = "",
}: LatestTextCardProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.Icon;
  const isWaiting = status === "waiting";
  const time = formatTime(receivedAt);

  return (
    <Card
      className={`w-full border p-3 shadow-none transition-colors ${config.border} ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Шапка (Заголовок + Бейдж) */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div
          className={`flex items-center gap-1.5 text-xs font-semibold ${config.text}`}
        >
          <Icon
            size={15}
            strokeWidth={2.2}
            className={status === "processing" ? "animate-spin" : ""}
          />
          <span>{config.title}</span>
        </div>

        <Badge
          variant="secondary"
          className={`shrink-0 border-0 text-[10px] px-1.5 py-0 rounded font-medium ${config.badgeStyle}`}
        >
          {config.badge}
        </Badge>
      </div>

      {/* Основной контент (Текст + Переименование) */}
      {!isWaiting && (text || renameText) && (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 break-all text-lg font-bold tracking-tight leading-tight mb-2 text-foreground">
          {text && (
            <span
              className={
                renameText
                  ? "text-muted-foreground line-through text-base font-normal"
                  : ""
              }
            >
              {text}
            </span>
          )}
          {renameText && (
            <>
              {text && (
                <span className="text-muted-foreground text-base font-normal">
                  →
                </span>
              )}
              <span className={config.text}>{renameText}</span>
            </>
          )}
        </div>
      )}

      {/* Подвал (Сообщение + Время) */}
      <div className="flex items-center justify-between gap-3 min-h-[16px]">
        <p className="min-w-0 text-xs text-muted-foreground truncate">
          {message || (isWaiting ? "Новых заданий пока нет" : "")}
        </p>

        {time && (
          <time className="shrink-0 text-[10px] tabular-nums text-muted-foreground/80 font-medium">
            {time}
          </time>
        )}
      </div>
    </Card>
  );
}

export default LatestTextCard;
