// Показывает состояние автопечати и доступность принтера, позволяет запускать и останавливать работу.
import {
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { LatestAutoPrintStatus } from "@/features/auto-print/types";

const demoScenarios = {
  printed: {
    label: "Успешная печать",
    status: "printed",
    text: "500-1",
    steps: [
      { status: "complete", message: "Текст получен" },
      { status: "complete", message: "Исключений не найдено" },
      { status: "complete", message: "Принтер доступен" },
      { status: "complete", message: "Отправлен на печать" },
    ],
  },
  excluded: {
    label: "Текст в исключениях",
    status: "skipped",
    text: "Прямой поток 500-1",
    steps: [
      { status: "complete", message: "Текст получен" },
      { status: "skipped", message: "Найдено исключение «Прямой поток»" },
      {
        status: "skipped",
        message: "Не напечатан: текст соответствует исключению",
      },
    ],
  },
  stopped: {
    label: "Автопечать выключена",
    status: "ignored",
    text: "500-2",
    steps: [
      { status: "complete", message: "Текст получен" },
      { status: "blocked", message: "Не напечатан: автопечать выключена" },
    ],
  },
  offline: {
    label: "Принтер недоступен",
    status: "ignored",
    text: "500-3",
    steps: [
      { status: "complete", message: "Текст получен" },
      { status: "complete", message: "Исключений не найдено" },
      { status: "blocked", message: "Не напечатан: принтер недоступен" },
    ],
  },
  error: {
    label: "Ошибка печати",
    status: "error",
    text: "500-4",
    steps: [
      { status: "complete", message: "Текст получен" },
      { status: "complete", message: "Исключений не найдено" },
      { status: "complete", message: "Принтер доступен" },
      { status: "error", message: "Ошибка отправки задания на печать" },
    ],
  },
} as const satisfies Record<
  string,
  {
    label: string;
    status: LatestAutoPrintStatus["status"];
    text: string;
    steps: LatestAutoPrintStatus["steps"];
  }
>;

type DemoScenario = keyof typeof demoScenarios;

function isDemoScenario(value: string): value is DemoScenario {
  return Object.prototype.hasOwnProperty.call(demoScenarios, value);
}

interface StatusCardProps {
  running: boolean;
  printerOnline: boolean;
  onToggleRunning: () => void;
  latestStatus: LatestAutoPrintStatus | null;
  showDemo: boolean;
}

export default function StatusCard({
  running,
  printerOnline,
  onToggleRunning,
  latestStatus,
  showDemo,
}: StatusCardProps) {
  const [selectedScenario, setSelectedScenario] =
    useState<DemoScenario>("printed");
  const displayedStatus = showDemo
    ? {
        id: Object.keys(demoScenarios).indexOf(selectedScenario) + 1,
        text: demoScenarios[selectedScenario].text,
        receivedAt: Date.now(),
        status: demoScenarios[selectedScenario].status,
        steps: demoScenarios[selectedScenario].steps,
      }
    : latestStatus;
  const resultStyle = displayedStatus
    ? displayedStatus.status === "printed"
      ? {
          title: "Обработка завершена успешно",
          className:
            "border-green-500/30 bg-green-500/[0.06] dark:bg-green-500/[0.04]",
          textClassName: "text-green-800 dark:text-green-300",
        }
      : displayedStatus.status === "error" ||
          displayedStatus.steps.some((step) => step.status === "blocked")
        ? {
            title: "Обработка остановлена",
            className: "border-red-500/30 bg-red-500/[0.06] dark:bg-red-500/[0.04]",
            textClassName: "text-red-800 dark:text-red-300",
          }
        : displayedStatus.status === "skipped"
          ? {
              title: "Задание пропущено по правилу",
              className:
                "border-amber-500/30 bg-amber-500/[0.06] dark:bg-amber-500/[0.04]",
              textClassName: "text-amber-800 dark:text-amber-300",
            }
          : {
              title: "Обработка задания",
              className: "border-border/70 bg-background/60",
              textClassName: "text-muted-foreground",
            }
    : null;

  // Настройка конфигурации без использования border-классов
  let statusConfig = {
    bgColor: "bg-amber-500/10 dark:bg-amber-500/5",
    textColor: "text-amber-800 dark:text-amber-400",
    message: "Приложение остановлено",
    hint: "Нажмите кнопку ниже, чтобы начать работу",
    icon: (
      <IconAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
    ),
  };

  if (running && !printerOnline) {
    statusConfig = {
      bgColor: "bg-red-500/10 dark:bg-red-500/5",
      textColor: "text-red-800 dark:text-red-400",
      message: "Принтер недоступен!",
      hint: "Проверьте, что принтер включен и подключен к компьютеру.",
      icon: (
        <IconAlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
      ),
    };
  } else if (running && printerOnline) {
    statusConfig = {
      bgColor: "bg-green-500/10 dark:bg-green-500/5",
      textColor: "text-green-800 dark:text-green-400",
      message: "Все отлично работает",
      hint: "Приложение запущено, принтер готов к печати",
      icon: (
        <IconCheck className="w-5 h-5 text-green-600 dark:text-green-500" />
      ),
    };
  }

  return (
    <section className="w-full rounded-xl border border-border bg-card p-2.5">
      <div
        className={`flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${statusConfig.bgColor}`}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span className="shrink-0 [&>svg]:size-4">{statusConfig.icon}</span>
          <h3
            className={`text-center text-[13px] font-bold leading-tight tracking-tight ${statusConfig.textColor}`}
          >
            {statusConfig.message}
          </h3>
        </div>
        <p className="text-center text-xs leading-snug text-neutral-600 dark:text-neutral-400">
          {statusConfig.hint}
        </p>
      </div>

      <div
        key={
          displayedStatus
            ? `${displayedStatus.id}-${displayedStatus.status}-${selectedScenario}`
            : "empty-status"
        }
        className={`mt-2 rounded-lg border p-2 transition-colors ${
          resultStyle?.className ?? "border-border/70 bg-background/60"
        } animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none`}
        aria-live="polite"
      >
        {showDemo && (
          <label className="mb-2 flex items-center justify-between gap-2 text-[11px] font-medium">
            Сценарий отображения
            <select
              value={selectedScenario}
              onChange={(event) => {
                if (isDemoScenario(event.target.value)) {
                  setSelectedScenario(event.target.value);
                }
              }}
              className="min-w-0 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-normal text-foreground"
            >
              {Object.entries(demoScenarios).map(([key, scenario]) => (
                <option key={key} value={key}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <h4 className={`text-xs font-semibold ${resultStyle?.textClassName ?? ""}`}>
          Последний полученный текст
        </h4>
        {displayedStatus ? (
          <>
            <p
              className={`mt-1 text-[11px] font-semibold ${
                resultStyle?.textClassName ?? ""
              }`}
            >
              {resultStyle?.title}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words rounded bg-muted/60 px-2 py-1 text-xs">
              {displayedStatus.text || "Пустой текст"}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Получен в{" "}
              {new Date(displayedStatus.receivedAt).toLocaleTimeString()}
            </p>
            <ol className="mt-2 space-y-0">
              {displayedStatus.steps.map((step, index) => {
                const stepStyle =
                  step.status === "complete"
                    ? {
                        marker: "border-green-600 bg-green-600 text-white",
                        connector: "bg-green-500/50",
                        text: "text-green-800 dark:text-green-300",
                        icon: "✓",
                      }
                    : step.status === "error" || step.status === "blocked"
                      ? {
                          marker: "border-red-600 bg-red-600 text-white",
                          connector: "bg-red-500/40",
                          text: "text-red-800 dark:text-red-300",
                          icon: "!",
                        }
                      : step.status === "skipped"
                        ? {
                            marker:
                              "border-amber-500 bg-amber-500 text-white",
                            connector: "bg-amber-500/40",
                            text: "text-amber-800 dark:text-amber-300",
                            icon: "−",
                          }
                        : {
                            marker:
                              "border-muted-foreground/40 bg-background text-muted-foreground",
                            connector: "bg-border",
                            text: "text-muted-foreground",
                            icon: "…",
                          };
                return (
                  <li
                    key={`${displayedStatus.id}-${index}`}
                    className="flex min-h-8 gap-2 animate-in fade-in slide-in-from-left-1 duration-300 motion-reduce:animate-none"
                    style={{ animationDelay: `${Math.min(index * 90, 360)}ms` }}
                  >
                    <span className="flex w-4 shrink-0 flex-col items-center">
                      <span
                        aria-hidden="true"
                        className={`z-10 flex size-4 animate-in zoom-in-75 items-center justify-center rounded-full border text-[9px] font-bold duration-300 motion-reduce:animate-none ${stepStyle.marker}`}
                        style={{
                          animationDelay: `${Math.min(index * 90, 360)}ms`,
                        }}
                      >
                        {stepStyle.icon}
                      </span>
                      {index < displayedStatus.steps.length - 1 && (
                        <span
                          aria-hidden="true"
                          className={`min-h-3 w-0.5 grow ${stepStyle.connector}`}
                        />
                      )}
                    </span>
                    <span
                      className={`pb-2 text-[11px] leading-snug ${stepStyle.text}`}
                    >
                      {step.message}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        ) : (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Ожидается первое задание автопечати.
          </p>
        )}
      </div>

      <div className="mt-1.5 flex justify-center">
        <Button
          size="default"
          onClick={onToggleRunning}
          className={`h-9 w-full max-w-64 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors active:scale-[0.98] ${
            running
              ? "bg-red-600 hover:bg-red-700 shadow-red-600/10"
              : "bg-green-600 hover:bg-green-700 shadow-green-600/10"
          }`}
        >
          {running ? (
            <>
              <IconPlayerStopFilled className="w-5 h-5 mr-2" />
              <span>Остановить работу</span>
            </>
          ) : (
            <>
              <IconPlayerPlayFilled className="w-5 h-5 mr-2" />
              <span>Запустить</span>
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
