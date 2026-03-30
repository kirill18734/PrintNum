import { useAppContext } from "../../AppContext";
import Home from "./Home";
import Settings from "./Settings";

function Main() {
  const { activeTab }: any = useAppContext();
  return (
    <main data-tauri-drag-region>{activeTab ? <Settings /> : <Home />}</main>
  );
}

export default Main;
