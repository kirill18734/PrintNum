import { useEffect, useState } from "react";
import type { LabelContentType } from "./LabelStudio";

interface PreviewPaperProps {
  mode: "autoprint" | "create";
  paper: string;
  idNum: boolean;
  endLine: boolean;
  hybrid: boolean;
  expand: number | string;
  contentType: LabelContentType;
  content: string;
  bold: boolean;
  underline: boolean;
  showCodeText: boolean;
}

const contentLabels: Record<LabelContentType, string> = {
  text: "Текст",
  barcode: "Штрихкод",
  qr: "QR-код",
  datamatrix: "Data Matrix",
};

interface GeneratedCode {
  svg: string | null;
  error: string | null;
  loading: boolean;
}

export default function PreviewPaper({
  mode,
  paper,
  idNum,
  endLine,
  hybrid,
  expand,
  contentType,
  content,
  bold,
  underline,
  showCodeText,
}: PreviewPaperProps) {
  const [rawWidth, rawHeight] = paper.split("*").map(Number);
  const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 30;
  const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 20;
  const previewWidth = Math.min(132, 88 * (width / height));
  const automatic = mode === "autoprint";
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({
    svg: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    if (automatic || contentType === "text" || !content.trim()) {
      setGeneratedCode({ svg: null, error: null, loading: false });
      return;
    }

    let cancelled = false;
    setGeneratedCode({ svg: null, error: null, loading: true });

    const generateCode = async () => {
      try {
        const bwipjs = await import("bwip-js/browser");
        const bcid =
          contentType === "barcode"
            ? "code128"
            : contentType === "qr"
              ? "qrcode"
              : "datamatrix";
        const svg = bwipjs.toSVG({
          bcid,
          text: content,
          scale: 3,
          padding: 0,
          backgroundcolor: "FFFFFF",
          barcolor: "000000",
        });
        if (!cancelled) {
          setGeneratedCode({ svg, error: null, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setGeneratedCode({
            svg: null,
            error: error instanceof Error ? error.message : String(error),
            loading: false,
          });
        }
      }
    };

    void generateCode();
    return () => {
      cancelled = true;
    };
  }, [automatic, content, contentType]);

  const renderLabel = (secondHybridLabel = false) => (
    <div
      className="flex max-h-22 min-h-11 items-center justify-center overflow-hidden rounded-md border border-neutral-300 bg-white p-1.5 text-center text-neutral-950 shadow-sm"
      style={{
        aspectRatio: `${width}/${height}`,
        width: `${previewWidth}px`,
        maxWidth: "100%",
      }}
    >
      {automatic ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          {(idNum || (hybrid && secondHybridLabel)) && (
            <span className="mb-1 w-full text-right text-[10px] leading-none">
              {hybrid && secondHybridLabel ? `${expand}−` : "−47"}
            </span>
          )}
          <span
            className={`line-clamp-3 break-words text-2xl ${
              hybrid && secondHybridLabel ? "font-bold" : ""
            } ${endLine ? "underline decoration-2 underline-offset-2" : ""}`}
          >
            123{!endLine && "."}
          </span>
        </div>
      ) : contentType === "text" ? (
        <span
          className={`line-clamp-4 break-words text-sm ${
            bold ? "font-bold" : "font-medium"
          } ${underline ? "underline decoration-2 underline-offset-2" : ""} ${
            content ? "" : "font-normal text-neutral-400"
          }`}
        >
          {content || "Ваш текст появится здесь"}
        </span>
      ) : (
        <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-0.5">
          {generatedCode.svg ? (
            <img
              src={`data:image/svg+xml,${encodeURIComponent(generatedCode.svg)}`}
              alt={`${contentLabels[contentType]} для введённых данных`}
              className="block min-h-0 max-h-full max-w-full flex-1 object-contain"
            />
          ) : (
            <p
              role={generatedCode.error ? "alert" : undefined}
              className={`px-1 text-center text-[10px] leading-tight ${
                generatedCode.error
                  ? "text-red-700"
                  : "text-neutral-400"
              }`}
            >
              {generatedCode.loading
                ? "Создаём код…"
                : generatedCode.error
                ? `Не удалось создать код: ${generatedCode.error}`
                : "Введите данные, чтобы увидеть код"}
            </p>
          )}
          {showCodeText && content.trim() && (
            <span className="max-w-full shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-[9px] leading-tight text-neutral-800">
              {content}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="w-full min-w-0">
      <div className="flex min-h-[4.5rem] items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-muted/50 p-2">
        <div className="flex min-w-0 flex-col items-center gap-0.5">
          {automatic && hybrid && (
            <span className="text-[10px] leading-tight text-muted-foreground">
              1–{Number(expand) - 1 < 1 ? expand : Number(expand) - 1}
            </span>
          )}
          {renderLabel()}
        </div>
        {automatic && hybrid && (
          <div className="flex min-w-0 flex-col items-center gap-0.5">
            <span className="text-[10px] leading-tight text-muted-foreground">
              от {expand}
            </span>
            {renderLabel(true)}
          </div>
        )}
      </div>
    </section>
  );
}
