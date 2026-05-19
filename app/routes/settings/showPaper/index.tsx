import Preview from "./preview";
import Settings from "./settings";

export default function showPaper({ config, sendChange }: any) {
  return (
    <div data-tauri-drag-region className="flex flex-col items-center gap-2">
      <span className="font-medium">Оформление этикетки</span>
      <div data-tauri-drag-region className="flex items-start gap-7 w-full">
        {/* Настройки */}
        <Settings config={config} sendChange={sendChange} />
        {/* Превью */}
        <Preview config={config} />
      </div>
    </div>
  );
}
