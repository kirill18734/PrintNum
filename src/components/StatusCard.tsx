import {
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface StatusCardProps {
  running: boolean;
  printerOnline: boolean;
  onToggleRunning: () => void;
}

export default function StatusCard({
  running,
  printerOnline,
  onToggleRunning,
}: StatusCardProps) {
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
