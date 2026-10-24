// Объединяет параметры оформления этикетки с её предпросмотром.
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
  preview: React.ReactNode;
  singleColumn?: boolean;
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
  preview,
  singleColumn = false,
}: ShowPaperProps) {
  return (
    <section aria-label="Настройки оформления автопечати" className="w-full min-w-0">
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
        preview={preview}
        singleColumn={singleColumn}
      />
      <p id="hybrid-format-hint" className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Гибридный формат: с указанного номера меняет местами номер ячейки и ID, выделяя основной текст жирным.
      </p>
    </section>
  );
}
