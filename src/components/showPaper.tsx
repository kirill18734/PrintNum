// Объединяет параметры оформления этикетки с её предпросмотром.
import SettingsPaper from "./settingsPaper";

interface ShowPaperProps {
  defaultIdNum: boolean;
  setDefaultIdNum: (value: boolean) => void;
  defaultEndLine: boolean;
  setDefaultEndLine: (value: boolean) => void;
  defaultHybrid: boolean;
  setDefaultHybrid: (value: boolean) => void;
  defaultExpand: number | "";
  setDefaultExpand: (value: number | "") => void;
  preview: React.ReactNode;
}

export default function ShowPaper({
  defaultIdNum,
  setDefaultIdNum,
  defaultEndLine,
  setDefaultEndLine,
  defaultHybrid,
  setDefaultHybrid,
  defaultExpand,
  setDefaultExpand,
  preview,
}: ShowPaperProps) {
  return (
    <section className="w-full rounded-md border border-border bg-card p-1">
      <h2 className="mb-0.5 text-center text-xs font-semibold leading-tight">
        Оформление этикетки
      </h2>
      <div className="mx-auto grid w-full max-w-[560px] grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-2">
        <div className="min-w-0 justify-self-center">
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
        </div>
        <div className="min-w-0 w-full justify-self-center">{preview}</div>
      </div>
    </section>
  );
}
