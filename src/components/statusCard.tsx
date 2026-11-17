import {
  CheckCircle2,
  LoaderCircle,
  Ban,
  Printer,
  AlertCircle,
  Clock,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import type { LatestTextStatus, StatusCardProps } from "@/types/printJob";

export type { LatestTextStatus, StatusCardProps } from "@/types/printJob";

const STATUS_CONFIG = {
  waiting: {
    label: "Ожидание",
    color: "text-muted-foreground",
    border: "border-border",
    Icon: Clock,
  },
  processing: {
    label: "Обработка",
    color: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30 bg-blue-500/[0.03]",
    Icon: LoaderCircle,
  },
  printed: {
    label: "Отправлено на печать",
    color: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30 bg-emerald-500/[0.03]",
    Icon: CheckCircle2,
  },
  excluded: {
    label: "Пропущено",
    color: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30 bg-amber-500/[0.03]",
    Icon: Ban,
  },
  printer_unavailable: {
    label: "Принтер недоступен",
    color: "text-destructive",
    border: "border-destructive/30 bg-destructive/[0.03]",
    Icon: Printer,
  },
  print_error: {
    label: "Ошибка печати",
    color: "text-destructive",
    border: "border-destructive/30 bg-destructive/[0.03]",
    Icon: AlertCircle,
  },
} satisfies Record<
  LatestTextStatus,
  {
    label: string;
    color: string;
    border: string;
    Icon: React.ElementType;
  }
>;

const STATUS_ANIMATION: Record<LatestTextStatus, string> = {
  waiting: "animate-status-waiting",
  processing: "animate-status-processing",
  printed: "animate-status-printed",
  excluded: "animate-status-excluded",
  printer_unavailable: "animate-status-printer",
  print_error: "animate-status-error",
};

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

export function StatusCard({
  status,
  text,
  renameText,
  receivedAt,
}: StatusCardProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.Icon;

  const isWaiting = status === "waiting";

  const originalText = text?.trim() || "";
  const renamedText = renameText?.trim() || "";

  const hasText = Boolean(originalText || renamedText);
  const hasRename = Boolean(originalText && renamedText);

  const time = formatTime(receivedAt);

  const description = isWaiting ? "Новых заданий пока нет" : null;

  return (
    <Card
      className={`
        flex h-[80px] w-full shrink-0 overflow-hidden
        border px-2.5 py-2 shadow-none
        transition-colors
        ${config.border}
      `}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Ожидание — по центру */}
      {isWaiting ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
          <div className="flex items-center gap-1.5">
            <Icon
              size={15}
              strokeWidth={2}
              className={`${config.color} ${STATUS_ANIMATION[status]}`}
            />

            <span className={`text-xs font-semibold ${config.color}`}>
              {config.label}
            </span>
          </div>

          {description && (
            <p className="text-[10px] text-muted-foreground">{description}</p>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 w-full flex-1 flex-col justify-evenly gap-1">
          {/* Статус — без времени */}
          <div className="flex shrink-0 items-center gap-1.5">
            <Icon
              size={13}
              strokeWidth={2}
              className={`
                shrink-0 ${config.color}
                ${STATUS_ANIMATION[status]}
              `}
            />

            <span
              className={`truncate text-[11px] font-semibold ${config.color}`}
            >
              {config.label}
            </span>
          </div>

          {/* Полученный текст */}
          {hasText && (
            <div className="min-h-0 overflow-hidden rounded-md border border-blue-500/10 bg-blue-500/[0.06] px-2 py-1.5 dark:bg-blue-400/[0.07]">
              {hasRename ? (
                <div className="flex min-w-0 items-center gap-1.5 text-[11px]">
                  <span className="min-w-0 truncate text-muted-foreground line-through">
                    {originalText}
                  </span>

                  <span className="shrink-0 text-blue-500">→</span>

                  <span className="min-w-0 truncate font-semibold text-foreground">
                    {renamedText}
                  </span>
                </div>
              ) : (
                <p className="truncate text-[11px] font-medium text-foreground">
                  {renamedText || originalText}
                </p>
              )}
            </div>
          )}

          {/* Информация о получении */}
          {hasText && (
            <div className="flex min-w-0 items-center gap-1 px-1">
              <Clock size={10} className="shrink-0 text-muted-foreground" />

              <span className="truncate text-[10px] text-muted-foreground">
                {hasRename ? "Получен и переименован" : "Получен"}

                {time && ` в ${time}`}
              </span>
            </div>
          )}

          {/* Дополнительное сообщение */}
          {description && (
            <p className="truncate text-[10px] leading-tight text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
