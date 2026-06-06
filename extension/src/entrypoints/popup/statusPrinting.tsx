import { useEffect, useState } from "react";
import { sendServer } from "@/utils/api";

export default function StatusPrinting() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkServer = async () => {
      try {
        const res = await sendServer.get();

        if (isMounted) {
          setIsActive(res.ok);
        }
      } catch {
        if (isMounted) {
          setIsActive(false);
        }
      }
    };

    // первый запуск сразу
    checkServer();

    // интервал 5 секунд
    const interval = setInterval(checkServer, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`flex items-center p-3 gap-3 border mb-4 w-full ${
        isActive
          ? "bg-emerald-500/10 border-emerald-500/20"
          : "bg-red-500/10 border-red-500/20"
      }`}
    >
      {/* индикатор */}
      <div className="relative flex h-3 w-3">
        {isActive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}

        <span
          className={`relative inline-flex rounded-full h-3 w-3 ${
            isActive ? "bg-emerald-500" : "bg-red-500"
          }`}
        ></span>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-bold text-sm tracking-wide ${
            isActive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isActive ? "Печать активна" : "Печать не активна"}
        </span>

        <span
          className={`text-xs ${
            isActive
              ? "text-emerald-600/80 dark:text-emerald-400/80"
              : "text-red-600/80 dark:text-red-400/80"
          }`}
        >
          {isActive
            ? "Сервис печати работает"
            : "Проверьте, что приложение PrintNum запущено."}
        </span>
      </div>
    </div>
  );
}
