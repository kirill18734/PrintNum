import { useStorageState } from "@/hooks/useStorageState";
import { createContext, useContext } from "react";

const RunningContext = createContext({});

export default function RunningProvider({ children }: any) {
  const [running, setRunning] = useStorageState("running", true);

  return (
    <RunningContext value={{ running, setRunning }}>{children}</RunningContext>
  );
}

export const useRunningContext = () => useContext(RunningContext);
