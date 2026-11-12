import { useEffect, useState } from "react";
import type { BackgroundItem } from "@/types/api";
import type { LabelContentType, TextInputMode } from "@/types/label";

interface PreviewPaperProps {
  idNum?: boolean;
  endLine?: boolean;
  hybrid?: boolean;
  expand?: number;
  font?: string;
  bold?: boolean;
  opacity?: number;

  mode: "autoprint" | "create";
  contentType?: LabelContentType;
  content?: string;
  underline?: boolean;
  showCodeText?: boolean;
  textInputMode?: TextInputMode;
  sequenceValue?: string;
  background?: string;
  setCodeImage?: (image: string) => void;
  dataBackgrounds?: BackgroundItem[];
}

const NOOP_SET_CODE_IMAGE = (_image: string) => {};

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
  setCodeImage = NOOP_SET_CODE_IMAGE,
  sequenceValue = "",
  background = "Без фона",
  dataBackgrounds = [],
  opacity,
}: PreviewPaperProps) {
  // Применение выбранного шрифта
  const fontStyle = {
    fontFamily: `${font}, sans-serif`,
  };

  // Получаем изображение выбранного фона
  const backgroundImage =
    background !== "Без фона"
      ? dataBackgrounds.find((item) => item.name === background)?.base64
      : undefined;

  // Состояние генерации кода
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({
    svg: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    // Проверяем условия отмены в самом начале
    if (mode === "autoprint" || contentType === "text" || !content.trim()) {
      setGeneratedCode({ svg: null, error: null, loading: false });
      setCodeImage("");
      return;
    }

    let cancelled = false;

    // Включаем лоадер одним махом
    setGeneratedCode({ svg: null, error: null, loading: true });
    setCodeImage("");

    const generateCode = async () => {
      try {
        // Динамический импорт bwip-js
        const bwipjs = await import("bwip-js/browser");
        if (cancelled) return;

        const bcid =
          contentType === "barcode"
            ? "code128"
            : contentType === "qr"
              ? "qrcode"
              : "datamatrix";

        const options = {
          bcid,
          text: content,
          scale: 3,
          padding: 0,
          backgroundcolor: "FFFFFF",
          barcolor: "000000",
        };

        // 1. Генерируем SVG (синхронно)
        const svg = bwipjs.toSVG(options);

        // 2. Генерируем Canvas (используем колбэк для гарантии отрисовки)
        const canvas = document.createElement("canvas");

        // bwipjs.toCanvas возвращает canvas, но надежнее дождаться завершения отрисовки
        bwipjs.toCanvas(canvas, options);

        // Получаем чистый Base64 (без префикса data:image/png;base64,)
        const codeImage = canvas.toDataURL("image/png").split(",")[1];

        if (!cancelled) {
          setGeneratedCode({
            svg,
            error: null,
            loading: false,
          });
          setCodeImage(codeImage);
        }
      } catch (error) {
        if (!cancelled) {
          setGeneratedCode({
            svg: null,
            error: error instanceof Error ? error.message : String(error),
            loading: false,
          });
          setCodeImage("");
        }
      }
    };

    void generateCode();

    return () => {
      cancelled = true;
    };
  }, [mode, content, contentType, setCodeImage]);

  // Общий слой фонового изображения
  const backgroundLayer = backgroundImage && (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: opacity !== undefined ? opacity / 100 : 0.5, // Преобразуем в диапазон от 0 до 1
      }}
    />
  );

  // Общая разметка этикетки
  const label = (
    <div
      style={fontStyle}
      className={`relative flex flex-col justify-center items-center
        ${hybrid && mode === "autoprint" ? "w-25 h-15 p-1.5" : "w-36 h-24 p-2"}
        rounded-lg border border-border
        bg-white text-black shadow-sm overflow-hidden`}
    >
      {backgroundLayer}

      {/* Содержимое этикетки */}
      <div className="relative z-10 flex flex-col justify-center items-center w-full flex-1 min-h-0">
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
          /* Обычный текст — Автомасштабируемый через SVG */
          <div className="flex justify-center items-center w-full h-full flex-1 min-h-0 overflow-hidden select-none">
            <svg
              viewBox="0 0 100 50" /* Пропорции контейнера, подстроятся под flex-1 */
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet" /* Центрирует и вписывает текст */
            >
              <text
                x="50"
                y="25"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="18" /* Базовый размер, который будет масштабироваться */
                className={`fill-current
                ${bold ? "font-bold" : ""}
                ${underline ? "underline" : ""}`}
              >
                {textInputMode === "single"
                  ? content || "Ваш текст"
                  : sequenceValue}
              </text>
            </svg>
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
    </div>
  );

  // Вторая этикетка для гибридного режима
  const hybridLabel = (
    <div
      style={fontStyle}
      className="relative flex flex-col justify-center items-center
        w-25 h-15 p-1.5 rounded-lg
        border border-border bg-white text-black shadow-sm overflow-hidden"
    >
      {backgroundLayer}

      <div className="relative z-10 flex flex-col justify-center items-center w-full flex-1 min-h-0">
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
