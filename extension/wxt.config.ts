import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ["storage"],
    action: {},
    name: "PrintNum - Печать Ячеек (Ozon)",
    description:
      "Дополнительные возможности для Ozon: печать ячеек, скрытие элементов, автоматизация процессов с помощью qr-кодов, автоскрипты",
  },

  srcDir: "src",
  vite: () => ({
    plugins: [react()],
  }),
});
