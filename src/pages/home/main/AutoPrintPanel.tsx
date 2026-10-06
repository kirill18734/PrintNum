import type { ReactNode } from "react";
import AutoPrintRules, {
  type SkippedPrintEvent,
} from "@/components/AutoPrintRules";
import ShowPaper from "@/components/showPaper";
import StatusCard from "@/components/StatusCard";

interface AutoPrintPanelProps {
  active: boolean;
  running: boolean;
  printerOnline: boolean;
  onToggleRunning: () => void;
  rules: string[];
  onRulesChange: (rules: string[]) => void;
  lastSkipped: SkippedPrintEvent | null;
  onDismissSkipped: () => void;
  idNum: string;
  onIdNumChange: (value: string) => void;
  endLine: string;
  onEndLineChange: (value: string) => void;
  hybrid: string;
  onHybridChange: (value: string) => void;
  expand: string;
  onExpandChange: (value: string) => void;
  preview: ReactNode;
}

export default function AutoPrintPanel({
  active,
  running,
  printerOnline,
  onToggleRunning,
  rules,
  onRulesChange,
  lastSkipped,
  onDismissSkipped,
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
        onToggleRunning={onToggleRunning}
      />
      <AutoPrintRules
        rules={rules}
        onRulesChange={onRulesChange}
        running={running}
        lastSkipped={lastSkipped}
        onDismissSkipped={onDismissSkipped}
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