// Корневой layout выбирает экран загрузки, приложения или установки обновления.
import { useAppRuntime } from "@/app/useAppRuntime";
import { useAppStore } from "./services/store";
import { Toaster } from "@/components/ui/toast";

import Home from "./pages/home";
import Updating from "./pages/updating";
import Loading from "./pages/loading";

export default function Layout() {
  useAppRuntime();

  const serverOnline = useAppStore((state) => state.serverOnline);
  const installUpdate = useAppStore((state) => state.installUpdate);

  return (
    <Toaster timeout={2800}>
      {installUpdate ? <Updating /> : serverOnline ? <Home /> : <Loading />}
    </Toaster>
  );
}
