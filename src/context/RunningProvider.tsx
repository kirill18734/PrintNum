import { tempConfig } from "@/config/tempConfig";
import { createContext, useContext, useEffect, useState } from "react";

const RunningContext = createContext({});

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

export default function RunningProvider({ children }) {
  const [running, setRunning] = usePersistedState("running", false);

  return (
    <RunningContext value={{ running, setRunning }}>{children}</RunningContext>
  );
}

export const useRunningContext = () => useContext(RunningContext);
