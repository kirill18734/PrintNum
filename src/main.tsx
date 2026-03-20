import React from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Command } from "@tauri-apps/plugin-shell";
import { MainContext } from "./AppContext";

import "./reset.scss";
import App from "./App";

// // ---------- Остановка backend ----------
getCurrentWindow().onCloseRequested(() => {
  Command.create("stop_backend").execute();
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MainContext>
      <App />
    </MainContext>
  </React.StrictMode>,
);
