import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

interface FittedTextProps {
  children: string;
  className?: string;
  singleLine?: boolean;
  preserveLineBreaks?: boolean;
  align?: "center" | "right";
}

function FittedText({
  children,
  className = "",
  singleLine = false,
  preserveLineBreaks = false,
  align = "center",
}: FittedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(8);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fitText = () => {
      const { clientWidth, clientHeight } = text;
      if (!clientWidth || !clientHeight) return;

      let low = 4;
      let high = Math.max(clientWidth, clientHeight) * 2;
      for (let i = 0; i < 14; i += 1) {
        const candidate = (low + high) / 2;
        text.style.fontSize = `${candidate}px`;
        if (
          text.scrollWidth <= clientWidth + 1 &&
          text.scrollHeight <= clientHeight + 1
        ) {
          low = candidate;
        } else {
          high = candidate;
        }
      }

      const nextFontSize = Math.max(4, Math.floor(low * 10) / 10);
      setFontSize((current) =>
        current === nextFontSize ? current : nextFontSize,
      );
    };

    fitText();
    const observer = new ResizeObserver(fitText);
    observer.observe(container);
    return () => observer.disconnect();
  }, [children, singleLine, preserveLineBreaks]);

  return (
    <div ref={containerRef} className="h-full min-h-0 w-full min-w-0">
      <span
        ref={textRef}
        className={`block h-full w-full leading-[1.05] ${
          singleLine
            ? "whitespace-nowrap"
            : preserveLineBreaks
              ? "whitespace-pre"
              : "whitespace-pre-wrap break-words"
        } ${className}`}
        style={{
          alignContent: "center",
          fontSize: `${fontSize}px`,
          overflowWrap: "anywhere",
          textAlign: align,
        }}
      >
        {children}
      </span>
    </div>
  );
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
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState({ width: 240, height: 244 });
  const [rawWidth, rawHeight] = paper.split("*").map(Number);
  const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 30;
  const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 20;
  const automatic = mode === "autoprint";
  const hybridAutomatic = automatic && hybrid;
  const labelAreaWidth = hybridAutomatic
    ? (frameSize.width - 6) / 2
    : frameSize.width;
  const labelAreaHeight = Math.max(
    1,
    frameSize.height - (hybridAutomatic ? 20 : 0),
  );
  const previewScale =
    (automatic
      ? Math.min(labelAreaWidth / width, labelAreaHeight / height)
      : Math.min(frameSize.width / width, frameSize.height / height)) * 0.7;
  const previewWidth = width * previewScale;
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({
    svg: null,
    error: null,
    loading: false,
  });

  useLayoutEffect(() => {
    const frame = previewFrameRef.current;
    if (!frame) return;

    const updateFrameSize = () => {
      setFrameSize({
        width: Math.max(1, frame.clientWidth - 16),
        height: Math.max(1, frame.clientHeight - 16),
      });
    };

    updateFrameSize();
    const observer = new ResizeObserver(updateFrameSize);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

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
      className="flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-md border border-neutral-300 bg-white p-1.5 text-center text-neutral-950 shadow-sm"
      style={{
        aspectRatio: `${width}/${height}`,
        width: `${previewWidth}px`,
        maxWidth: "100%",
      }}
    >
      {automatic ? (
        <>
          {(idNum || (hybrid && secondHybridLabel)) && (
            <div className="h-[22%] min-h-0 w-full shrink-0 text-right">
              <FittedText align="right" singleLine>
                {hybrid && secondHybridLabel ? `${expand}−` : "−47"}
              </FittedText>
            </div>
          )}
          <div className="flex min-h-0 w-full flex-1 items-center justify-center">
            <FittedText
              className={`${
                hybrid && secondHybridLabel ? "font-bold" : "font-normal"
              } ${endLine ? "underline decoration-2 underline-offset-2" : ""}`}
              singleLine
            >
              {`123${endLine ? "" : "."}`}
            </FittedText>
          </div>
        </>
      ) : contentType === "text" ? (
        <FittedText
          className={`${
            bold ? "font-bold" : "font-medium"
          } ${underline ? "underline decoration-2 underline-offset-2" : ""} ${
            content ? "" : "font-normal text-neutral-400"
          }`}
          preserveLineBreaks
        >
          {content || "Ваш текст появится здесь"}
        </FittedText>
      ) : (
        <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-0.5">
          {generatedCode.svg ? (
            <img
              src={`data:image/svg+xml,${encodeURIComponent(generatedCode.svg)}`}
              alt={`${contentLabels[contentType]} для введённых данных`}
              className={`block min-h-0 max-h-full max-w-full flex-1 object-contain ${
                contentType === "barcode" ? "w-full" : ""
              }`}
            />
          ) : (
            <div
              role={generatedCode.error ? "alert" : undefined}
              className={`flex min-h-0 w-full flex-1 items-center justify-center px-1 ${
                generatedCode.error
                  ? "text-red-700"
                  : "text-neutral-400"
              }`}
            >
              <FittedText>
                {generatedCode.loading
                  ? "Создаём код…"
                  : generatedCode.error
                    ? `Не удалось создать код: ${generatedCode.error}`
                    : "Введите данные, чтобы увидеть код"}
              </FittedText>
            </div>
          )}
          {showCodeText && content.trim() && (
            <div className="h-[18%] min-h-0 w-full shrink-0 text-neutral-800">
              <FittedText singleLine>{content}</FittedText>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="w-full min-w-0">
      <div
        ref={previewFrameRef}
        className={`flex min-w-0 items-center justify-center gap-1.5 rounded-lg bg-muted/50 p-2 ${
          automatic ? "h-[140px]" : "h-[260px]"
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
          {automatic && hybrid && (
            <span className="text-[10px] leading-tight text-muted-foreground">
              1–{Number(expand) - 1 < 1 ? expand : Number(expand) - 1}
            </span>
          )}
          {renderLabel()}
        </div>
        {automatic && hybrid && (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
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
