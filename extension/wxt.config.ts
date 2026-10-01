import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ["storage"],
    action: {},
    name: "PrintNum - Печать Ячеек (Ozon)",
    description:
      "Полезные инструменты для turbo-pvz.ozon.ru: печать ячеек и удобная автоматизация по QR-кодам",
  },

  srcDir: "src",
  vite: () => ({
    plugins: [react()],
    build: {
      // Указываем Vite компилировать под современные стандарты
      target: "es2022",
    },
    esbuild: {
      // Запрещаем внутреннему esbuild транспилировать приватные поля в функции .call()
      target: "es2022",
    },
  }),
});
