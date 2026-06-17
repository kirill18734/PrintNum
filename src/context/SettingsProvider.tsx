import { useStorageState } from "@/hooks/useStorageState";
import { sendServer } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext({});

export default function SettingsProvider({ children }: any) {
  const [printer, setPrinter] = useStorageState("printer", "");
  const [paper, setPaper] = useStorageState("paper", "30*20");
  const [idNum, setIdNum] = useStorageState("idNum", false);
  const [endLine, setEndLine] = useStorageState("endLine", false);
  const [hybrid, setHybrid] = useStorageState("hybrid", false);
  const [expand, setExpand] = useStorageState("expand", 500);

  const listPapers = [
    "30*20",
    "40*30",
    "43*25",
    "50*70",
    "58*40",
    "60*40",
    "75*120",
    "100*150",
  ];

  const [listPrinters, setListPrinters] = useState([]);

  const updateListPrinters = async () => {
    try {
      const response = await sendServer.get("listPrinters");
      const body = await response.json();

      setListPrinters((prev: any) => {
        const next = body.listPrinters;

        // простая проверка по ссылке (быстрая)
        if (prev === next) return prev;

        // более надёжная проверка (по содержимому)
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev;

        return next;
      });
    } catch {
      setListPrinters((prev: any) => (prev.length === 0 ? prev : []));
    }
  };

  useEffect(() => {
    updateListPrinters();

    const interval = setInterval(updateListPrinters, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SettingsContext
      value={{
        printer,
        setPrinter,
        listPrinters,
        setListPrinters,
        paper,
        setPaper,
        listPapers,
        idNum,
        setIdNum,
        endLine,
        setEndLine,
        hybrid,
        setHybrid,
        expand,
        setExpand,
      }}
    >
      {children}
    </SettingsContext>
  );
}

export const useSettingsContext = () => useContext(SettingsContext);
