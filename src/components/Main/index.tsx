import { useAppContext } from "../../AppContext";
import Home from "./Home";
import Settings from "./Settings";

function Main() {
  const { activeTab }: any = useAppContext();
  return (
    <main data-tauri-drag-region className="main">
      {activeTab ? <Settings /> : <Home />}
    </main>
  );
}

export default Main;
