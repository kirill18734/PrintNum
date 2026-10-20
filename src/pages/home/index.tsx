// Собирает главный экран из верхней панели, рабочей области и нижней панели.
import { useEffect } from "react";
import Header from "./header";
import Main from "./main/index";
import Footer from "./footer";
import { isTauri } from "@/services/app.tauri";

export default function Home() {
  useEffect(() => {
    if (!isTauri) return;

    const root = document.getElementById("root");
    if (!root) return;

    let raf = 0;
    let resizing = false;
    let pendingHeight: number | null = null;
    let disposed = false;

    const queueResize = () => {
      const target = Math.ceil(root.scrollHeight);
      if (pendingHeight !== null && target === pendingHeight) return;
      pendingHeight = target;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        void applyResize();
      });
    };

    const applyResize = async () => {
      if (resizing || pendingHeight === null) return;
      resizing = true;
      try {
        const { LogicalSize } = await import("@tauri-apps/api/dpi");
        const { getCurrentWindow, currentMonitor, primaryMonitor } = await import("@tauri-apps/api/window");
        const win = getCurrentWindow();

        // Получаем монитор окна (или основной) для расчёта максимально допустимой логической высоты
        const mon = (await currentMonitor()) ?? (await primaryMonitor());
        let maxLogicalHeight = Number.POSITIVE_INFINITY;
        if (mon) {
          const workAreaLogical = mon.workArea.size.toLogical(mon.scaleFactor);
          const SAFE = 32; // небольшой отступ от краёв
          maxLogicalHeight = Math.max(200, workAreaLogical.height - SAFE);
        }

        while (!disposed && pendingHeight !== null) {
          const requestedHeight = pendingHeight;
          pendingHeight = null;

          // Ограничиваем целевую высоту рабочей областью монитора
          const targetHeight = Math.min(requestedHeight, maxLogicalHeight);

          const [inn, scale] = await Promise.all([
            win.innerSize(),
            win.scaleFactor(),
          ]);
          const logical = inn.toLogical(scale);
          if (Math.ceil(logical.height) !== targetHeight) {
            await win.setSize(new LogicalSize(logical.width, targetHeight));
          }
        }
      } catch (e) {
        console.error("Auto-resize failed:", e);
      } finally {
        resizing = false;
      }
    };

    const ro = new ResizeObserver(queueResize);
    ro.observe(root);
    queueResize();

    return () => {
      disposed = true;
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="flex w-full flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 select-none">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
// Собирает главный экран из верхней панели, рабочей области и нижней панели.
