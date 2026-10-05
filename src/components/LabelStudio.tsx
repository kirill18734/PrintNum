import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type LabelContentType = "text" | "barcode" | "qr" | "datamatrix";

interface LabelStudioProps {
  printerReady: boolean;
  isPrinting: boolean;
  printError: string | null;
  onPrint: () => void;
  contentType: LabelContentType;
  onContentTypeChange: (value: LabelContentType) => void;
  content: string;
  onContentChange: (value: string) => void;
  bold: boolean;
  onBoldChange: (value: boolean) => void;
  underline: boolean;
  onUnderlineChange: (value: boolean) => void;
  showCodeText: boolean;
  onShowCodeTextChange: (value: boolean) => void;
  preview: ReactNode;
}

const contentTypes: { id: LabelContentType; label: string }[] = [
  { id: "text", label: "Текст" },
  { id: "barcode", label: "Штрихкод" },
  { id: "qr", label: "QR-код" },
  { id: "datamatrix", label: "Data Matrix" },
];

const contentLabels: Record<LabelContentType, string> = {
  text: "Текст на этикетке",
  barcode: "Данные для штрихкода",
  qr: "Данные для QR-кода",
  datamatrix: "Данные для Data Matrix",
};

const placeholders: Record<LabelContentType, string> = {
  text: "Например: Заказ № 12345",
  barcode: "Введите цифры или текст",
  qr: "Вставьте текст или ссылку",
  datamatrix: "Введите данные для кода",
};

export default function LabelStudio({
  printerReady,
  isPrinting,
  printError,
  onPrint,
  contentType,
  onContentTypeChange,
  content,
  onContentChange,
  bold,
  onBoldChange,
  underline,
  onUnderlineChange,
  showCodeText,
  onShowCodeTextChange,
  preview,
}: LabelStudioProps) {
  return (
    <section className="w-full rounded-xl border border-border bg-card p-2.5">
      <div className="mb-2">
        <h2 className="text-center text-sm font-semibold leading-tight">
          Создать этикетку
        </h2>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
          Выберите тип содержимого и задайте его параметры.
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start justify-items-center gap-3 max-[380px]:grid-cols-1">
        <div className="min-w-0">
          <div
            role="tablist"
            aria-label="Тип содержимого этикетки"
            className="grid grid-cols-2 gap-1 rounded-lg bg-muted/70 p-1"
          >
            {contentTypes.map(({ id, label }) => (
              <button
                key={id}
                id={`label-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={contentType === id}
                aria-controls="label-editor-panel"
                onClick={() => onContentTypeChange(id)}
                className={`min-h-8 rounded-md px-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  contentType === id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            id="label-editor-panel"
            role="tabpanel"
            aria-labelledby={`label-tab-${contentType}`}
            className="mt-2 rounded-lg border border-border bg-background p-2"
          >
            <label className="flex flex-col gap-1.5 text-[13px] font-medium">
              {contentLabels[contentType]}
              {contentType === "text" ||
              contentType === "qr" ||
              contentType === "datamatrix" ? (
                <textarea
                  value={content}
                  onChange={(event) => onContentChange(event.target.value)}
                  placeholder={placeholders[contentType]}
                  rows={2}
                  className="min-h-16 w-full select-text resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                />
              ) : (
                <Input
                  value={content}
                  onChange={(event) => onContentChange(event.target.value)}
                  placeholder={placeholders[contentType]}
                  className="h-9 select-text text-sm font-normal"
                />
              )}
            </label>

            {contentType === "text" ? (
              <div className="mt-2 flex flex-col items-start gap-1.5">
                <label className="inline-flex min-h-5 items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={bold}
                    onChange={(event) => onBoldChange(event.target.checked)}
                    className="size-4 shrink-0 accent-primary"
                  />
                  Жирный текст
                </label>
                <label className="inline-flex min-h-5 items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={underline}
                    onChange={(event) => onUnderlineChange(event.target.checked)}
                    className="size-4 shrink-0 accent-primary"
                  />
                  Подчёркивание
                </label>
              </div>
            ) : (
              <label className="mt-2 inline-flex min-h-5 items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showCodeText}
                  onChange={(event) =>
                    onShowCodeTextChange(event.target.checked)
                  }
                  className="size-4 shrink-0 accent-primary"
                />
                Показывать текст под кодом
              </label>
            )}
          </div>
        </div>

        <div className="min-w-0 w-full max-w-64 justify-self-center">{preview}</div>
      </div>

      <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-snug text-muted-foreground">
          {printerReady
            ? "Этикетка будет отправлена на выбранный принтер."
            : "Выберите принтер и проверьте его подключение."}
        </p>
        <Button
          type="button"
          disabled={!printerReady || isPrinting || !content.trim()}
          onClick={onPrint}
          className="h-9 w-full shrink-0 rounded-lg text-sm sm:w-auto"
        >
          {isPrinting ? "Печать…" : "Распечатать"}
        </Button>
      </div>
      {printError && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {printError}
        </p>
      )}
    </section>
  );
}
