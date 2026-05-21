import { tempConfig } from "@/config/tempConfig";
import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext({});

function usePersistedState(key: string, defaultValue: any) {
  const [state, setState] = useState(() => {
    const value = tempConfig[key] || defaultValue;
    return value;
  });

  // сохранение в конфиге
  useEffect(() => {
    const confValue = tempConfig[key];
    if (confValue !== state) {
      tempConfig[key] = state;
    }
  }, [state]);

  return [state, setState];
}

export default function SettingsProvider({ children }) {
  const [printer, setPrinter] = usePersistedState("printer", "testPrinter");

  const [paper, setPaper] = usePersistedState("paper", "30*20");

  const [idNum, setIdNum] = usePersistedState("idNum", false);
  const [endLine, setEndLine] = usePersistedState("endLine", true);
  const [hybrid, setHybrid] = usePersistedState("hybrid", false);
  const [expand, setExpand] = usePersistedState("expand", 500);

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

  const [listPrinters, setListPrinters] = useState([
    "testPrinter",
    "test2",
    "test3",
  ]);

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
