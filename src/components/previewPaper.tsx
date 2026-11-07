import { useEffect, useState } from "react";
import { LabelContentType } from "./settingsCreatePaper";

interface PreviewPaperProps {
  idNum?: boolean;
  endLine?: boolean;
  hybrid?: boolean;
  expand?: number;
  font?: string;
  bold?: boolean;

  mode: "autoprint" | "create";
  contentType?: LabelContentType;
  content?: string;
  underline?: boolean;
  showCodeText?: boolean;
  textInputMode: string;
  sequenceValue: string;
}

interface GeneratedCode {
  svg: string | null;
  error: string | null;
  loading: boolean;
}

export default function PreviewPaper({
  idNum = false,
  endLine = false,
  hybrid = false,
  expand = 500,
  font = "Arial",
  bold = false,

  mode = "autoprint",
  contentType = "text",
  content = "",
  underline = false,
  showCodeText = false,
  textInputMode = "single",
  sequenceValue = "",
}: PreviewPaperProps) {
  // Применение выбранного шрифта
  const fontStyle = {
    fontFamily: `"${font.split("-")[0].replace(/([a-z])([A-Z])/g, "$1 $2")}", sans-serif`,
  };

  // Состояние генерации кода
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({
    svg: null,
    error: null,
    loading: false,
  });

  // Генерация штрихкода / QR / Data Matrix
  useEffect(() => {
    if (mode === "autoprint" || contentType === "text" || !content.trim()) {
      setGeneratedCode({
        svg: null,
        error: null,
        loading: false,
      });
      return;
    }

    let cancelled = false;

    setGeneratedCode({
      svg: null,
      error: null,
      loading: true,
    });

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
          setGeneratedCode({
            svg,
            error: null,
            loading: false,
          });
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
  }, [mode, content, contentType]);

  // Общая разметка этикетки
  const label = (
    <div
      style={fontStyle}
      className={`flex flex-col justify-center items-center
        ${hybrid && mode === "autoprint" ? "w-25 h-15 p-1.5" : "w-36 h-24 p-2"}
        rounded-lg border border-border
        bg-white text-black shadow-sm overflow-hidden`}
    >
      {/* Номер этикетки */}
      {idNum && (
        <div className="flex justify-end items-center w-full h-[0.5rem] shrink-0">
          <span className="text-[0.6rem]">−47</span>
        </div>
      )}

      {/* Режим автоматической печати */}
      {mode === "autoprint" ? (
        <div className="flex justify-center items-center leading-none flex-1 min-h-0">
          <span
            className={`${hybrid ? "text-4xl" : "text-6xl"}
              ${endLine ? "underline decoration-3" : ""}
              ${bold ? "font-bold" : ""}`}
          >
            123{!endLine && "."}
          </span>
        </div>
      ) : contentType === "text" ? (
        /* Обычный текст */
        <div className="flex justify-center items-center leading-none flex-1 min-h-0 w-full">
          <span
            className={`text-center whitespace-pre-wrap break-words max-w-full md:text-base
              ${bold ? "font-bold" : ""}
              ${underline ? "underline decoration-2" : ""}`}
          >
            {textInputMode == "single"
              ? content || "Ваш текст появится здесь"
              : sequenceValue}
          </span>
        </div>
      ) : (
        /* Штрихкод / QR / Data Matrix */
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

          {/* Исходный текст под кодом */}
          {showCodeText && content.trim() && (
            <span className="text-xs text-center text-black shrink-0 max-w-full truncate">
              {content}
            </span>
          )}
        </div>
      )}
    </div>
  );

  // Вторая этикетка для гибридного режима
  const hybridLabel = (
    <div
      style={fontStyle}
      className="flex flex-col justify-center items-center
        w-25 h-15 p-1.5 rounded-lg
        border border-border bg-white text-black shadow-sm overflow-hidden"
    >
      <div className="flex justify-start items-center w-full h-[0.5rem] shrink-0">
        <span className="text-[0.6rem]">{expand}−</span>
      </div>

      <div className="flex justify-center items-center leading-none flex-1 min-h-0">
        <span
          className={`text-4xl font-bold
            ${endLine ? "underline decoration-3" : ""}`}
        >
          123{!endLine && "."}
        </span>
      </div>
    </div>
  );

  return (
    <div
      data-tauri-drag-region
      className={`flex items-center w-full
        ${hybrid ? "justify-between gap-1" : "justify-center"}`}
    >
      <div className="flex flex-col items-center gap-1">
        {hybrid && mode === "autoprint" && (
          <span className="text-xs text-muted-foreground">
            Этикетки 1 – {expand - 1 < 1 ? expand : expand - 1}
          </span>
        )}

        {label}
      </div>

      {hybrid && mode === "autoprint" && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">
            Этикетки от {expand}
          </span>

          {hybridLabel}
        </div>
      )}
    </div>
  );
}
