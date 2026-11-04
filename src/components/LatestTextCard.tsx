import type { LatestAutoPrintStatus } from "@/features/auto-print/types";

type LatestTextStatus =
  | "waiting"
  | "processing"
  | "printed"
  | "excluded"
  | "printer_unavailable"
  | "print_error";

interface LatestTextCardProps {
  text: string | null;
  status: LatestTextStatus;
  message?: string;
  receivedAt?: Date | string | null;
}

type StatusView = {
  label: string;
  message: string;
  badgeClass: string;
  messageClass: string;
};

function getStatusView(status: LatestAutoPrintStatus): StatusView {
  const lastStep = status.steps.at(-1);

  switch (status.status) {
    case "printed":
      return {
        label: "Напечатан",
        message: "Успешно отправлен на печать",
        badgeClass: "bg-green-500/10 text-green-700 dark:text-green-400",
        messageClass: "text-green-700 dark:text-green-400",
      };

    case "skipped": {
      const exclusion = status.steps.find((step) => step.status === "skipped");

      return {
        label: "Пропущен",
        message: exclusion?.message ?? "Текст соответствует исключению",
        badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        messageClass: "text-amber-700 dark:text-amber-400",
      };
    }

    case "ignored": {
      const reason = lastStep?.message ?? "Задание не было напечатано";

      const printerUnavailable = reason
        .toLowerCase()
        .includes("принтер недоступен");

      return {
        label: printerUnavailable ? "Ошибка" : "Не напечатан",
        message: reason,
        badgeClass: printerUnavailable
          ? "bg-red-500/10 text-red-700 dark:text-red-400"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        messageClass: printerUnavailable
          ? "text-red-700 dark:text-red-400"
          : "text-amber-700 dark:text-amber-400",
      };
    }

    case "error":
      return {
        label: "Ошибка печати",
        message: lastStep?.message ?? "Не удалось отправить задание на печать",
        badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400",
        messageClass: "text-red-700 dark:text-red-400",
      };

    case "processing":
      return {
        label: "Обработка",
        message: lastStep?.message ?? "Задание обрабатывается...",
        badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
        messageClass: "text-muted-foreground",
      };
  }
}

export default function LatestTextCard({ latestStatus }: LatestTextCardProps) {
  if (!latestStatus) {
    return (
      <section
        className="w-full rounded-xl border border-border bg-card px-3 py-2.5"
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold">Последний полученный текст</h3>

          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-400">
            Ожидание
          </span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Ожидание новых заданий...
        </p>
      </section>
    );
  }

  const view = getStatusView(latestStatus);

  const renameStep = latestStatus.steps.find((step) =>
    step.message.startsWith("Переименовано в "),
  );

  const renamedText = renameStep?.message.slice("Переименовано в ".length);

  const receivedTime = new Date(latestStatus.receivedAt).toLocaleTimeString(
    "ru-RU",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    },
  );

  return (
    <section
      className="w-full rounded-xl border border-border bg-card px-3 py-2.5"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold">Последний полученный текст</h3>

        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${view.badgeClass}`}
        >
          {view.label}
        </span>
      </div>

      <div className="mt-1.5 flex min-w-0 items-center gap-2">
        <span className="min-w-0 break-words text-lg font-bold leading-tight">
          {latestStatus.text || "Пустой текст"}
        </span>

        {renamedText && (
          <>
            <span className="shrink-0 text-muted-foreground">→</span>

            <span className="min-w-0 break-words rounded bg-green-500/10 px-1.5 py-0.5 text-sm font-bold text-green-700 dark:text-green-400">
              {renamedText}
            </span>
          </>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <p
          className={`min-w-0 break-words text-[11px] leading-snug ${view.messageClass}`}
        >
          {view.message}
        </p>

        <time className="shrink-0 text-[10px] text-muted-foreground">
          {receivedTime}
        </time>
      </div>
    </section>
  );
}
