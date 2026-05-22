// import { tempConfig } from "@/config/tempConfig";
import { getValue, resetConf, setValue } from "@/services/config";
import { createContext, useContext, useEffect, useState } from "react";

const RunningContext = createContext({});

function usePersistedState(key: string, defaultValue: any) {
  const [state, setState] = useState(
    (async () => {
      // await resetConf();
      const value = await getValue(key);
      return value || defaultValue;
    })(),
  );

  // сохранение в конфиге
  useEffect(() => {
    (async () => {
      // const value = await getValue(key);
      // console.log(value);
      // if (value !== state) await setValue(key, state);
    })();
  }, [key, state]);

  return [state, setState];
}

export default function RunningProvider({ children }) {
  const [running, setRunning] = usePersistedState("running", true);
  console.log(running);
  return (
    <RunningContext value={{ running, setRunning }}>{children}</RunningContext>
  );
}

export const useRunningContext = () => useContext(RunningContext);
