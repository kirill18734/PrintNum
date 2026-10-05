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
  preview,
}: any) {
  return (
    <section className="w-full rounded-xl border border-border bg-card p-2.5">
      <h2 className="mb-2 text-center text-sm font-semibold leading-tight">
        Оформление этикетки
      </h2>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center justify-items-center gap-2.5 max-[380px]:grid-cols-1">
        <div data-tauri-drag-region className="min-w-0 max-w-full justify-self-center">
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
        <div className="min-w-0 w-full max-w-64 justify-self-center">{preview}</div>
      </div>
    </section>
  );
}
