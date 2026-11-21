// Точка входа: инициализирует приложение и подключает корневой React-компонент.
import React from "react";
import ReactDOM from "react-dom/client";
import { bootstrapApp } from "./app/bootstrap";
import Layout from "./layout";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Не найден корневой элемент приложения");
}

const root = ReactDOM.createRoot(rootElement);
void bootstrapApp()
  .then(() => {
    root.render(
      <React.StrictMode>
        <Layout />
      </React.StrictMode>,
    );
  })
  .catch((error: unknown) => {
    console.error("Не удалось инициализировать приложение:", error);
    root.render(
      <div
        role="alert"
        className="p-4 text-sm text-red-700 bg-red-50 rounded-lg"
      >
        <p className="font-semibold mb-1">Не удалось запустить приложение</p>
        <p>
          Произошла ошибка. Пожалуйста, попробуйте перезапустить программу. Если
          проблема повторится, отправьте файл технической поддержки из папки:
          <code className="bg-red-100 px-1 py-0.5 rounded font-mono text-xs">
            %localappdata%\printnum\logs
          </code>
        </p>
      </div>,
    );
  });
