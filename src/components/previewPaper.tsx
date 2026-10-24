// Строит масштабируемый предпросмотр этикетки с текстом и штрихкодом/QR-кодом.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LabelContentType } from "./LabelStudio";
import { prepareAutoPrintLabel } from "@/features/auto-print/labelPreview";

interface PreviewPaperProps {
  mode: "autoprint" | "create";
  autoPrintText: string | null;
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
  align?: "center" | "right" | "left";
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
  autoPrintText,
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
  const parsedMain = (() => { const [m] = (autoPrintText ?? "").split("-"); return /^\d+$/.test(m) ? Number(m) : null; })();
  const [rawWidth, rawHeight] = paper.split("*").map(Number);
  const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 30;
  const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 20;
  const automatic = mode === "autoprint";
  const autoLabel = autoPrintText !== null
    ? prepareAutoPrintLabel(autoPrintText, { idNum, endLine, hybrid, expand, bold })
    : null;
  const previewScale = Math.min(frameSize.width / width, frameSize.height / height);
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

  const renderLabel = () => (
    <div
      className="flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-md border border-neutral-300 bg-white p-1.5 text-center text-neutral-950 shadow-sm"
      style={{
        aspectRatio: `${width}/${height}`,
        width: `${previewWidth}px`,
        maxWidth: "100%",
        fontFamily: automatic ? "Arial, sans-serif" : undefined,
      }}
    >
      {automatic ? (
        autoLabel ? (
          <>
            {autoLabel.headerText && (
              <div className="h-[22%] min-h-0 w-full shrink-0">
                <FittedText align={autoLabel.headerLeft ? "left" : "right"} singleLine>
                  {autoLabel.headerText}
                </FittedText>
              </div>
            )}
            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
              <FittedText
                className={`${autoLabel.bold ? "font-bold" : "font-normal"} ${autoLabel.underline ? "underline decoration-2 underline-offset-2" : ""}`}
                singleLine
              >
                {autoLabel.mainText}
              </FittedText>
            </div>
          </>
        ) : (
          <p className="text-xs text-neutral-400">Ожидание обработанного текста</p>
        )
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

  const renderHybridVariant = (variant: 'before'|'after') => {
    if (!autoPrintText) return renderLabel();
    const exp = Number(expand) || 1;
    const overrideExpand = variant === 'before' ? Math.max((parsedMain ?? exp) + 1, exp + 1) : 1;
    const label = prepareAutoPrintLabel(autoPrintText, { idNum, endLine, hybrid: true, expand: overrideExpand, bold });
    const active = variant === 'after' ? (parsedMain !== null && parsedMain >= Number(expand)) : (parsedMain !== null && parsedMain < Number(expand));
    const twoColScale = Math.min(((frameSize.width - 8) / 2) / width, frameSize.height / height);
    return (
      <div className={`flex min-w-0 flex-col items-center gap-0.5 rounded-lg p-1 ${active ? 'ring-2 ring-primary/60' : ''}`}>
        <span className="text-[10px] leading-tight text-muted-foreground">{variant === 'before' ? `До № ${Number(expand) - 1}` : `С № ${expand}`}</span>
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <div className="flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-md border border-neutral-300 bg-white p-1.5 text-center text-neutral-950 shadow-sm" style={{ aspectRatio: `${width}/${height}`, width: `${twoColScale * width}px`, maxWidth: '100%', fontFamily: 'Arial, sans-serif' }}>
            {label.headerText && (
              <div className="h-[22%] min-h-0 w-full shrink-0">
                <FittedText align={label.headerLeft ? 'left' : 'right'} singleLine>{label.headerText}</FittedText>
              </div>
            )}
            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
              <FittedText className={`${label.bold ? 'font-bold' : 'font-normal'} ${label.underline ? 'underline decoration-2 underline-offset-2' : ''}`} singleLine>{label.mainText}</FittedText>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full min-w-0">
      <div
        ref={previewFrameRef}
        className="flex h-[140px] min-w-0 items-center justify-center gap-1.5 rounded-lg bg-muted/50 p-2"
      >
        {automatic && hybrid && autoPrintText ? (
          <div className="grid w-full grid-cols-2 items-start gap-1 max-[460px]:grid-cols-1">
            {renderHybridVariant('before')}
            {renderHybridVariant('after')}
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
            {renderLabel()}
          </div>
        )}
      </div>
    </section>
  );
}
