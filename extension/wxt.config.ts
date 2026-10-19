import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ["storage"],
    host_permissions: [
      "http://127.0.0.1/*",
      "https://raw.githubusercontent.com/*",
      "https://printnum.s3.cloud.ru/*",
    ],
    action: {},
    name: "PrintNum - Печать Ячеек (Ozon)",
    description:
      "Полезные инструменты для turbo-pvz.ozon.ru: печать ячеек и удобная автоматизация по QR-кодам",
  },

  srcDir: "src",
  vite: () => ({
    plugins: (react() as any),
    build: {
      target: "es2022",
    },
    esbuild: {
      target: "es2022",
    },
  }) as any,
});
