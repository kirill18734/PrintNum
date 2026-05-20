import { createContext, useContext, useState, useEffect } from "react";
import { sendServer } from "./services/api";

const AppContext = createContext({});

export const MainContext = ({ children }: { children: React.ReactNode }) => {
  const [serverOnline, setServerOnline] = useState(true);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState(false);
  const [printerOnline, setPrinterOnline] = useState(false);
  const [themeStyle, setThemeStyle] = useState("vercel");
  const [paper, setPaper] = useState("30*20");
  const [listPapers, setListPapers] = useState([]);
  const [printer, setPrinter] = useState("");
  const [listPrinters, setListPrinters] = useState([]);
  const [idNum, setIdNum] = useState(false);
  const [endLine, setEndLine] = useState(false);
  const [hybrid, setHybrid] = useState(false);
  const [expandNum, setExpandNum] = useState(500);
  const [theme, setTheme] = useState("light");

  // const checkServerStatus = async () => {
  //   await sendServer
  //     .get()
  //     .then((response) => {
  //       console.log("Server status:", response);
  //       if (!serverOnline) setServerOnline(true);
  //     })
  //     .catch(() => {
  //       if (serverOnline) setServerOnline(false);
  //     });
  // };

  // useEffect(() => {
  //   const interval = setInterval(checkServerStatus, 1000);
  //   return () => clearInterval(interval);
  // }, [serverOnline]);

  return (
    <AppContext
      value={{
        serverOnline,
        running,
        setRunning,
        tab,
        setTab,
        printerOnline,
        setPrinterOnline,
        themeStyle,
        setThemeStyle,
        paper,
        setPaper,
        listPapers,
        setListPapers,
        printer,
        setPrinter,
        listPrinters,
        setListPrinters,
        idNum,
        setIdNum,
        endLine,
        setEndLine,
        hybrid,
        setHybrid,
        expandNum,
        setExpandNum,
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext>
  );
};

export const useAppContext = () => useContext(AppContext);
