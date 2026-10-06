import type { ReactNode } from "react";
import LabelStudio, {
  type LabelContentType,
} from "@/components/LabelStudio";

interface CreateLabelPanelProps {
  active: boolean;
  printerReady: boolean;
  printerOnline: boolean;
  printerSelected: boolean;
  isPrinting: boolean;
  printError: string | null;
  onPrint: () => void;
  contentType: LabelContentType;
  onContentTypeChange: (contentType: LabelContentType) => void;
  content: string;
  onContentChange: (value: string) => void;
  bold: boolean;
  onBoldChange: (bold: boolean) => void;
  underline: boolean;
  onUnderlineChange: (underline: boolean) => void;
  showCodeText: boolean;
  onShowCodeTextChange: (show: boolean) => void;
  preview: ReactNode;
}

export default function CreateLabelPanel({
  active,
  ...labelStudioProps
}: CreateLabelPanelProps) {
  return (
    <div
      id="mode-panel-create"
      role="tabpanel"
      aria-labelledby="mode-tab-create"
      className={active ? "" : "hidden"}
    >
      <LabelStudio {...labelStudioProps} />
    </div>
  );
}