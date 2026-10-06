// Форма создания этикетки с выбором типа содержимого и параметров оформления.
import type { ReactNode } from "react";
import { Barcode, Grid3X3, QrCode, Text } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type LabelContentType = "text" | "barcode" | "qr" | "datamatrix";

interface LabelStudioProps {
  printerReady: boolean;
  printerOnline: boolean;
  printerSelected: boolean;
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

const contentTypes = [
  { id: "text", label: "Текст", icon: Text },
  { id: "barcode", label: "Штрихкод", icon: Barcode },
  { id: "qr", label: "QR-код", icon: QrCode },
  { id: "datamatrix", label: "Data Matrix", icon: Grid3X3 },
] satisfies {
  id: LabelContentType;
  label: string;
  icon: typeof Text;
}[];

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

const maxContentLength = 100;

export default function LabelStudio({
  printerReady,
  printerOnline,
  printerSelected,
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
            {contentTypes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`label-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={contentType === id}
                aria-controls="label-editor-panel"
                onClick={() => onContentTypeChange(id)}
                className={`flex min-h-8 items-center justify-center gap-1 rounded-md px-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  contentType === id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                <Icon aria-hidden="true" className="size-3.5 shrink-0" />
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
                  onChange={(event) =>
                    onContentChange(event.target.value.slice(0, maxContentLength))
                  }
                  placeholder={placeholders[contentType]}
                  rows={2}
                  maxLength={maxContentLength}
                  className="min-h-16 w-full select-text resize-none overflow-y-auto rounded-lg border border-input bg-background px-2.5 py-2 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                />
              ) : (
                <Input
                  value={content}
                  onChange={(event) =>
                    onContentChange(event.target.value.slice(0, maxContentLength))
                  }
                  placeholder={placeholders[contentType]}
                  maxLength={maxContentLength}
                  className="h-8 select-text text-[13px] font-normal"
                />
              )}
            </label>
            <p className="mt-1 text-right text-[11px] leading-tight text-muted-foreground">
              {content.length}/{maxContentLength}
            </p>

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

        <div className="min-w-0 w-full justify-self-center">
          <p className="mb-1 text-center text-xs leading-snug text-muted-foreground">
            Так будет выглядеть распечатанная этикетка
          </p>
          {preview}
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p
          role={!printerReady ? "status" : undefined}
          className={`text-xs leading-snug ${
            printerReady
              ? "text-muted-foreground"
              : "font-medium text-destructive"
          }`}
        >
          {printerReady
            ? "Этикетка будет отправлена на выбранный принтер."
            : printerSelected && !printerOnline
              ? "Принтер недоступен. Проверьте, что он включён и подключён."
              : "Выберите принтер для печати."}
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
