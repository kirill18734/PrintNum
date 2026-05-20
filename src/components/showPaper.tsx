import PreviewPaper from "./previewPaper";
import SettingsPaper from "./settingsPaper";

export default function ShowPaper({ idNum, endLine, hybrid, expand }: any) {
  return (
    <div data-tauri-drag-region className="flex flex-col items-center gap-2">
      <span className="font-medium">Оформление этикетки</span>
      <div data-tauri-drag-region className="flex items-start gap-7 w-full">
        {/* Настройки */}
        <SettingsPaper
          idNum={idNum}
          endLine={endLine}
          hybrid={hybrid}
          expand={expand}
        />
        {/* Превью */}
        <PreviewPaper
          idNum={idNum}
          endLine={endLine}
          hybrid={hybrid}
          expand={expand}
        />
      </div>
    </div>
  );
}
