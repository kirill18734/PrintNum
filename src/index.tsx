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
      <div role="alert" className="p-4 text-sm text-red-700">
        Не удалось запустить приложение. Подробности доступны в консоли.
      </div>,
    );
  });
