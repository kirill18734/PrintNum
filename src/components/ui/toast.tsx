import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type ToastKind = "success" | "warning" | "error";
interface ToastMessage { id: number; message: string; kind: ToastKind; }
interface ToastContextValue { showToast: (message: string, kind?: ToastKind) => void; }
const ToastContext = React.createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastKind, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  error: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const nextId = React.useRef(0);
  const showToast = React.useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, message, kind }]);
  }, []);
  const removeToast = React.useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider duration={2800}>
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            open
            onOpenChange={(open) => { if (!open) removeToast(toast.id); }}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border px-3 py-2 text-xs font-medium shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0",
              toastStyles[toast.kind],
            )}
          >
            <ToastPrimitive.Description>{toast.message}</ToastPrimitive.Description>
            <ToastPrimitive.Close aria-label="Закрыть уведомление" className="shrink-0 rounded p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2">×</ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="pointer-events-none fixed right-3 top-3 z-[100] flex w-[min(320px,calc(100vw-24px))] flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast должен использоваться внутри ToastProvider");
  return context;
}
