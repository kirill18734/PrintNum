import { Separator } from "@/components/ui/separator";
import Printer from "./printer";
import Paper from "./paper";
import ShowPaper from "./showPaper";
import Theme from "./theme";
import Style from "./style";
import { useAppContext } from "@/AppContext";

export default function Settings() {
  const { themeStyle }: any = useAppContext();
  return (
    <div
      data-tauri-drag-region
      className=" flex-1 flex flex-col justify-between h-full gap-2"
    >
      <span data-tauri-drag-region className="text-center text-blue-600 mt-2">
        OZON
      </span>
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        {/* Принтер */}
        <Printer config={config} sendChange={sendChange} />
        {/* Бумага */}
        <Paper config={config} sendChange={sendChange} />
      </div>
      <Separator />

      <ShowPaper config={config} sendChange={sendChange} />

      <Separator />
      {/* тема/стиль */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-center gap-10"
      >
        <Theme />
        <Style themeStyle={themeStyle} />
      </div>
      <div data-tauri-drag-region className="flex items-center justify-center">
        v
      </div>
    </div>
  );
}
