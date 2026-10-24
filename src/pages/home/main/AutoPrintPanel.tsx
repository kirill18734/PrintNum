import type { ReactNode } from "react";
import AutoPrintRules from "@/components/AutoPrintRules";
import type { LatestAutoPrintStatus } from "@/features/auto-print/types";
import { getDisplayPipeline } from "@/features/auto-print/pipeline";
import type { ManualPrintJob } from "@/features/label-creation/types";
import PipelineStage from "../../../components/PipelineStage";

interface AutoPrintPanelProps {
  mode: "autoprint" | "create";
  manualJob: ManualPrintJob | null;
  printerReady: boolean;
  readinessMessage: string;
  latestStatus: LatestAutoPrintStatus | null;
  rules: string[];
  onRulesChange: (rules: string[]) => void;
  printerSettings: ReactNode;
  appearance: ReactNode;
}

export default function AutoPrintPanel({
  printerReady,
  readinessMessage,
  latestStatus,
  rules,
  onRulesChange,
  printerSettings,
  appearance,
  mode,
  manualJob,
}: AutoPrintPanelProps) {
  const { stages } = getDisplayPipeline(
    latestStatus,
    manualJob,
    mode,
    printerReady,
    readinessMessage,
  );

  return (
    <ol aria-label="Этапы печати" className="w-full min-w-0">
      <PipelineStage number={1} title="" state={stages.readiness}>
        {printerSettings}
      </PipelineStage>

      {/* Этап 2: контейнер без заголовка с двумя вкладками */}
      <PipelineStage number={2} title="" state={stages.formatting}>
        {appearance}
        {mode === "autoprint" && (
          <div className="mt-2">
            <AutoPrintRules
              rules={rules}
              onRulesChange={onRulesChange}
              running={printerReady}
            />
          </div>
        )}
      </PipelineStage>

      <PipelineStage
        number={3}
        title="Результат"
        state={stages.result}
        last
      ></PipelineStage>
    </ol>
  );
}
