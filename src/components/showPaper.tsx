import PreviewPaper from "./previewPaper";
import SettingsPaper from "./settingsPaper";

interface ShowPaperProps {
  defaultIdNum: boolean;
  setDefaultIdNum: (value: boolean) => void;
  defaultEndLine: boolean;
  setDefaultEndLine: (value: boolean) => void;
  defaultBold: boolean;
  setDefaultBold: (value: boolean) => void;
  defaultHybrid: boolean;
  setDefaultHybrid: (value: boolean) => void;
  defaultExpand: number | "";
  setDefaultExpand: (value: number | "") => void;
}
export default function ShowPaper({
  defaultIdNum,
  setDefaultIdNum,
  defaultEndLine,
  setDefaultEndLine,
  defaultBold,
  setDefaultBold,
  defaultHybrid,
  setDefaultHybrid,
  defaultExpand,
  setDefaultExpand,
}: ShowPaperProps) {
  return (
    <div data-tauri-drag-region className="flex flex-col gap-1">
      <span className="font-medium text-center">Оформление этикетки</span>
      <div
        data-tauri-drag-region
        className="flex items-start justify-center w-full"
      >
        {/* Настройки */}
        <SettingsPaper
          idNum={defaultIdNum}
          setIdNum={setDefaultIdNum}
          endLine={defaultEndLine}
          setEndLine={setDefaultEndLine}
          bold={defaultBold}
          setBold={setDefaultBold}
          hybrid={defaultHybrid}
          setHybrid={setDefaultHybrid}
          expand={defaultExpand}
          setExpand={setDefaultExpand}
        />
        {/* Превью */}
        <PreviewPaper
          idNum={defaultIdNum}
          endLine={defaultEndLine}
          bold={defaultBold}
          hybrid={defaultHybrid}
          expand={defaultExpand}
        />
      </div>
    </div>
  );
}
