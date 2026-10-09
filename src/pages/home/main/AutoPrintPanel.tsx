// Панель управления автопечатью, исключениями и настройками этикетки.
import type { ReactNode } from "react";
import AutoPrintRules from "@/components/AutoPrintRules";
import ShowPaper from "@/components/showPaper";
import StatusCard from "@/components/StatusCard";
import type { LatestAutoPrintStatus } from "@/features/auto-print/types";

interface AutoPrintPanelProps {
  active: boolean;
  running: boolean;
  printerOnline: boolean;
  latestStatus: LatestAutoPrintStatus | null;
  showDemo: boolean;
  onToggleRunning: () => void;
  rules: string[];
  onRulesChange: (rules: string[]) => void;
  idNum: boolean;
  onIdNumChange: (value: boolean) => void;
  endLine: boolean;
  onEndLineChange: (value: boolean) => void;
  hybrid: boolean;
  onHybridChange: (value: boolean) => void;
  expand: number | "";
  onExpandChange: (value: number | "") => void;
  preview: ReactNode;
}

export default function AutoPrintPanel({
  active,
  running,
  printerOnline,
  latestStatus,
  showDemo,
  onToggleRunning,
  rules,
  onRulesChange,
  idNum,
  onIdNumChange,
  endLine,
  onEndLineChange,
  hybrid,
  onHybridChange,
  expand,
  onExpandChange,
  preview,
}: AutoPrintPanelProps) {
  return (
    <div
      id="mode-panel-autoprint"
      role="tabpanel"
      aria-labelledby="mode-tab-autoprint"
      className={`flex flex-col gap-2 ${active ? "" : "hidden"}`}
    >
      <StatusCard
        running={running}
        printerOnline={printerOnline}
        latestStatus={latestStatus}
        showDemo={showDemo}
        onToggleRunning={onToggleRunning}
      />
      <AutoPrintRules
        rules={rules}
        onRulesChange={onRulesChange}
        running={running}
      />
      <ShowPaper
        defaultIdNum={idNum}
        setDefaultIdNum={onIdNumChange}
        defaultEndLine={endLine}
        setDefaultEndLine={onEndLineChange}
        defaultHybrid={hybrid}
        setDefaultHybrid={onHybridChange}
        defaultExpand={expand}
        setDefaultExpand={onExpandChange}
        preview={preview}
      />
    </div>
  );
}
// Панель управления автопечатью, правилами исключения и настройками этикетки.