export default function StatusPrinting() {
  return (
    <div className="flex items-center p-3 gap-3 bg-emerald-500/10 border border-emerald-500/20 mb-4 w-full">
      {/* Пульсирующий зеленый круг активности */}
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm tracking-wide">
          Печать активна
        </span>
        <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
          Расширение готово к работе
        </span>
      </div>
    </div>
  );
}
