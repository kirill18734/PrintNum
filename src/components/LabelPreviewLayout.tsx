import type { ReactNode } from "react";

interface LabelPreviewLayoutProps {
  left: ReactNode;
  right: ReactNode;
  preview: ReactNode;
}

export default function LabelPreviewLayout({ left, right, preview }: LabelPreviewLayoutProps) {
  const singleColumn = right === null;
  return (
    <div className={`label-preview-layout${singleColumn ? " single-column" : ""}`}>
      <div className="label-options-left flex min-w-0 flex-col gap-2">{left}</div>
      <figure aria-label="Предпросмотр этикетки" className="label-preview-center min-w-0 w-full">
        <figcaption className="mb-1 text-center text-xs text-muted-foreground">Предпросмотр</figcaption>
        {preview}
      </figure>
      {right !== null && (
        <div className="label-options-right flex min-w-0 flex-col gap-2">{right}</div>
      )}
    </div>
  );
}
