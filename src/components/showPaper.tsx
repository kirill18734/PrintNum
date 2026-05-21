import PreviewPaper from "./previewPaper";
import SettingsPaper from "./settingsPaper";

export default function ShowPaper({
  defaultIdNum,
  setDefaultIdNum,
  defaultEndLine,
  setDefaultEndLine,
  defaultHybrid,
  setDefaultHybrid,
  defaultExpand,
  setDefaultExpand,
}: any) {
  return (
    <div data-tauri-drag-region className="flex flex-col items-center gap-2">
      <span className="font-medium">Оформление этикетки</span>
      <div data-tauri-drag-region className="flex items-start gap-7 w-full">
        {/* Настройки */}
        <SettingsPaper
          idNum={defaultIdNum}
          setIdNum={setDefaultIdNum}
          endLine={defaultEndLine}
          setEndLine={setDefaultEndLine}
          hybrid={defaultHybrid}
          setHybrid={setDefaultHybrid}
          expand={defaultExpand}
          setExpand={setDefaultExpand}
        />
        {/* Превью */}
        <PreviewPaper
          idNum={defaultIdNum}
          endLine={defaultEndLine}
          hybrid={defaultHybrid}
          expand={defaultExpand}
        />
      </div>
    </div>
  );
}
