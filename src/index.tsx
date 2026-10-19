import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./layout";
import ThemeProvider from "./context/ThemeProvider";
import ThemeStyleProvider from "./context/ThemeStyleProvider";
import RunningProvider from "./context/RunningProvider";
import AppProvider from "./context/AppProvider";
import SettingsProvider from "./context/SettingsProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemeStyleProvider>
        <AppProvider>
          <SettingsProvider>
            <RunningProvider>
              <Layout />
            </RunningProvider>
          </SettingsProvider>
        </AppProvider>
      </ThemeStyleProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
