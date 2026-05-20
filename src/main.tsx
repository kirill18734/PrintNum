import React from "react";
import ReactDOM from "react-dom/client";
import { MainContext } from "./AppContext";

import Layout from "./layout";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MainContext>
      <Layout />
    </MainContext>
  </React.StrictMode>,
);
