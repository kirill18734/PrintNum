import {
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { Item, ItemActions } from "@/components/ui/item";
import { Button } from "@/components/ui/button";

// Описание типов входных параметров (props)
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
  // Определение конфигурации статуса на основе пропсов
  let statusConfig = {
    bgColor:
      "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50",
    textColor: "text-amber-800 dark:text-amber-400",
    message: "Приложение остановлено",
    hint: "Нажмите кнопку ниже, чтобы начать работу",
    icon: <IconAlertCircle className="w-5 h-5 text-amber-500" />,
  };

  if (running && !printerOnline) {
    statusConfig = {
      bgColor:
        "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50",
      textColor: "text-red-800 dark:text-red-400",
      message: "Принтер недоступен!",
      hint: "Проверьте, что принтер включен и подключен к компьютеру.",
      icon: <IconAlertCircle className="w-5 h-5 text-red-500 animate-bounce" />,
    };
  } else if (running && printerOnline) {
    statusConfig = {
      bgColor:
        "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50",
      textColor: "text-green-800 dark:text-green-400",
      message: "Все отлично работает",
      hint: "Приложение запущено, принтер готов к печати",
      icon: <IconCheck className="w-5 h-5 text-green-500" />,
    };
  }

  return (
    <Item
      data-tauri-drag-region
      className="w-full max-w-sm rounded-2xl border p-5 shadow-xl bg-white dark:bg-neutral-900 transition-all duration-300"
    >
      {/* Плашка статуса */}
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 ${statusConfig.bgColor}`}
      >
        <div className="mt-0.5 shrink-0">{statusConfig.icon}</div>
        <div className="flex flex-col gap-0.5">
          <h3
            className={`font-bold text-sm tracking-tight ${statusConfig.textColor}`}
          >
            {statusConfig.message}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-normal">
            {statusConfig.hint}
          </p>
        </div>
      </div>

      {/* Кнопка действия */}
      <ItemActions className="mt-5 w-full">
        <Button
          size="lg"
          onClick={onToggleRunning}
          className={`w-full h-14 rounded-xl text-base font-semibold text-white shadow-md transition-all active:scale-[0.98] ${
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
      </ItemActions>
    </Item>
  );
}
