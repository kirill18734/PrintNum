import {
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { Item, ItemActions } from "@/components/ui/item";
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
        <IconAlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 animate-bounce" />
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
    <Item
      data-tauri-drag-region
      className="w-full max-w-sm rounded-2xl p-4 bg-neutral-50 dark:bg-neutral-900/50 transition-all duration-300"
    >
      {/* Мягкая плашка статуса без рамки */}
      <div
        className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${statusConfig.bgColor}`}
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
      <ItemActions className="mt-2 w-full">
        <Button
          size="lg"
          onClick={onToggleRunning}
          className={`w-full h-14 rounded-xl text-base font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${
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
