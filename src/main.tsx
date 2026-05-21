import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./layout";
import ThemeProvider from "./context/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  </React.StrictMode>,
);
