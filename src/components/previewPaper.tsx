import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LabelContentType, TextInputMode } from "@/types/label";
import {
  loadBackgroundPreview,
  loadFontPreview,
} from "@/services/resources.tauri";
import { generateCodeImage } from "@/shared/utils/generateCodeImage";

interface PreviewPaperProps {
  idNum?: boolean;
  endLine?: boolean;
  expand?: string;
  font?: string;
  bold?: boolean;
  showBarcode?: boolean;
  opacity?: number;

  mode: "autoprint" | "create";
  contentType?: LabelContentType;
  content?: string;
  underline?: boolean;
  showCodeText?: boolean;
  textInputMode?: TextInputMode;
  sequenceValue?: string;
  background?: string;
}

interface GeneratedCode {
  svg: string | null;
  error: string | null;
  loading: boolean;
}

interface FittedTextProps {
  children: string;
  className?: string;
  fontFamilyKey?: string;
}

/** Подбирает максимальный размер шрифта, при котором строка целиком помещается в этикетку. */
function FittedText({
  children,
  className = "",
  fontFamilyKey = "",
}: FittedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(8);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fitText = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      let low = 4;
      let high = Math.max(width, height) * 2;
      for (let i = 0; i < 16; i += 1) {
        const candidate = (low + high) / 2;
        text.style.fontSize = `${candidate}px`;
        if (text.scrollWidth <= width + 1 && text.scrollHeight <= height + 1) {
          low = candidate;
        } else {
          high = candidate;
        }
      }

      const nextSize = Math.max(4, Math.floor(low * 10) / 10);
      setFontSize((current) => (current === nextSize ? current : nextSize));
    };

    fitText();
    const observer = new ResizeObserver(fitText);
    observer.observe(container);
    return () => observer.disconnect();
  }, [children, fontFamilyKey]);

  return (
    <div ref={containerRef} className="h-full min-h-0 w-full min-w-0">
      <span
        ref={textRef}
        className={`block h-full w-full whitespace-nowrap leading-none ${className}`}
        style={{
          alignContent: "center",
          fontSize: `${fontSize}px`,
          textAlign: "center",
        }}
      >
        {children}
      </span>
    </div>
  );
}

export default function PreviewPaper({
  idNum = false,
  endLine = false,
  expand = "",
  font = "Arial",
  bold = false,
  showBarcode = false,

  mode = "autoprint",
  contentType = "text",
  content = "",
  underline = false,
  showCodeText = false,
  textInputMode = "single",
  sequenceValue = "",
  background = "Без фона",
  opacity,
}: PreviewPaperProps) {
  const expandNumber = Number(expand) || 0;
  const isExpandActive = expandNumber > 0;

  // Шрифт и фон относятся только к текстовым этикеткам.
  const isTextLabel = mode === "autoprint" || contentType === "text";
  const cssFontFamily = `"${font.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  const fontStyle = isTextLabel
    ? { fontFamily: `${cssFontFamily}, sans-serif` }
    : undefined;

  const [backgroundImage, setBackgroundImage] = useState<string>();
  const [fontBase64, setFontBase64] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    if (!isTextLabel || !background || background === "Без фона") {
      setBackgroundImage(undefined);
      return;
    }
    setBackgroundImage(undefined);
    void loadBackgroundPreview(background)
      .then((image) => {
        if (!cancelled) setBackgroundImage(image);
      })
      .catch((error) => {
        if (!cancelled) {
          setBackgroundImage(undefined);
          console.error("Не удалось загрузить фон для Preview:", error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [background, isTextLabel]);

  useEffect(() => {
    let cancelled = false;
    if (!font || font === "Arial") {
      setFontBase64(undefined);
      return;
    }
    setFontBase64(undefined);
    void loadFontPreview(font)
      .then((item) => {
        if (!cancelled) setFontBase64(item.base64);
      })
      .catch((error) => {
        if (!cancelled) {
          setFontBase64(undefined);
          console.error("Не удалось загрузить шрифт для Preview:", error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [font]);

  const fontFace = fontBase64
    ? `@font-face { font-family: ${cssFontFamily}; src: url("data:font/${font.toLowerCase().endsWith(".otf") ? "otf" : "ttf"};base64,${fontBase64}") format("${font.toLowerCase().endsWith(".otf") ? "opentype" : "truetype"}"); font-weight: 400; font-style: normal; }`
    : "";

  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({
    svg: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    const isAutoPrintQr = mode === "autoprint" && showBarcode;
    const codeType = isAutoPrintQr
      ? "qr"
      : mode === "create" && contentType !== "text"
        ? contentType
        : null;
    const codeContent = isAutoPrintQr ? "123" : content;

    if (!codeType || !codeContent.trim()) {
      setGeneratedCode({ svg: null, error: null, loading: false });
      return;
    }

    let cancelled = false;
    setGeneratedCode({ svg: null, error: null, loading: true });

    const generateCode = async () => {
      try {
        const { svg } = await generateCodeImage(codeType, codeContent);
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
  }, [mode, content, contentType, showBarcode]);

  const backgroundLayer = backgroundImage && (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: opacity !== undefined ? opacity / 100 : 0.5,
      }}
    />
  );

  const label = (
    <div
      style={fontStyle}
      className={`relative flex flex-col justify-center items-center
        ${isExpandActive && mode === "autoprint" ? "w-25 h-15 p-1.5" : "w-36 h-24 p-2"}
        rounded-lg border border-border
        bg-white text-black shadow-sm overflow-hidden`}
    >
      {backgroundLayer}

      {mode === "autoprint" && showBarcode && generatedCode.svg && (
        <img
          src={`data:image/svg+xml,${encodeURIComponent(generatedCode.svg)}`}
          alt="QR-код товара"
          className={`absolute top-1 right-1 z-20 block bg-white object-contain ${isExpandActive ? "size-5 p-0.5" : "size-8 p-0.5"}`}
        />
      )}

      <div
        className={`relative z-10 flex flex-col justify-center items-center w-full flex-1 min-h-0 ${
          showBarcode ? (isExpandActive ? "pt-7" : "pt-9") : ""
        }`}
      >
        {idNum && (
          <div className="flex justify-end items-center w-full h-[0.5rem] shrink-0">
            <span className="text-[0.6rem]">−47</span>
          </div>
        )}

        {mode === "autoprint" ? (
          <div className="flex flex-1 min-h-0 w-full items-center justify-center gap-1">
            <div className="flex min-w-0 flex-1 items-center justify-center leading-none">
              <span
                className={`${showBarcode ? (isExpandActive ? "text-xl" : "text-6xl") : isExpandActive ? "text-4xl" : "text-6xl"}
                  ${endLine ? "underline decoration-3" : ""}
                  ${bold ? "font-bold" : ""}`}
              >
                123{!endLine && "."}
              </span>
            </div>
          </div>
        ) : contentType === "text" ? (
          <div className="flex flex-1 min-h-0 w-full items-center justify-center overflow-hidden select-none">
            <FittedText
              fontFamilyKey={font}
              className={`${bold ? "font-bold" : "font-medium"} ${underline ? "underline decoration-2 underline-offset-2" : ""}`}
            >
              {textInputMode === "single"
                ? content || "Ваш текст"
                : sequenceValue}
            </FittedText>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center flex-1 min-h-0 w-full gap-1">
            {generatedCode.svg ? (
              <img
                src={`data:image/svg+xml,${encodeURIComponent(generatedCode.svg)}`}
                alt="Сгенерированный код"
                className={`block min-h-0 max-h-full max-w-full flex-1 object-contain
                  ${contentType === "barcode" ? "w-full" : ""}`}
              />
            ) : (
              <div
                role={generatedCode.error ? "alert" : undefined}
                className={`flex flex-1 min-h-0 w-full items-center justify-center text-center text-xs
                  ${generatedCode.error ? "text-red-600" : "text-muted-foreground"}`}
              >
                {generatedCode.loading
                  ? "Создаём код…"
                  : generatedCode.error
                    ? `Ошибка генерации: ${generatedCode.error}`
                    : "Введите данные для генерации кода"}
              </div>
            )}

            {showCodeText && content.trim() && (
              <span className="text-xs text-center text-black shrink-0 max-w-full truncate">
                {content}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const nextLabel = (
    <div
      style={fontStyle}
      className="relative flex flex-col justify-center items-center
        w-25 h-15 p-1.5 rounded-lg
        border border-border bg-white text-black shadow-sm overflow-hidden"
    >
      {backgroundLayer}

      {mode === "autoprint" && showBarcode && generatedCode.svg && (
        <img
          src={`data:image/svg+xml,${encodeURIComponent(generatedCode.svg)}`}
          alt="QR-код товара"
          className="absolute top-1 right-1 z-20 block size-5 bg-white p-0.5 object-contain"
        />
      )}

      <div className="relative z-10 flex flex-col justify-center items-center w-full flex-1 min-h-0 pt-7">
        <div className="flex justify-start items-center w-full h-[0.5rem] shrink-0">
          <span className="text-[0.6rem]">{expandNumber}−</span>
        </div>

        <div className="flex flex-1 min-h-0 w-full items-center justify-center gap-1">
          <div className="flex min-w-0 flex-1 items-center justify-center leading-none">
            <span
              className={`${showBarcode ? "text-sm" : "text-4xl"} font-bold
                ${endLine ? "underline decoration-3" : ""}`}
            >
              123{!endLine && "."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      data-tauri-drag-region
      className={`flex items-center w-full
        ${isExpandActive ? "justify-between gap-1" : "justify-center"}`}
    >
      {fontFace && <style>{fontFace}</style>}
      <div className="flex flex-col items-center gap-1">
        {isExpandActive && mode === "autoprint" && (
          <span className="text-xs text-muted-foreground">
            Этикетки 1 –{" "}
            {expandNumber - 1 < 1 ? expandNumber : expandNumber - 1}
          </span>
        )}
        {label}
      </div>

      {isExpandActive && mode === "autoprint" && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">
            Этикетки от {expandNumber}
          </span>
          {nextLabel}
        </div>
      )}
    </div>
  );
}
