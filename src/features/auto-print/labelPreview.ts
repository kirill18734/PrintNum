import type { LatestAutoPrintStatus } from "./types.ts";
import { getPipeline } from "./pipeline.ts";

export function getRenamedText(event: LatestAutoPrintStatus | null): string | null {
  const prefix = "Переименовано в ";
  const rename = event?.steps.find((step) => step.status === "complete" && step.message.startsWith(prefix));
  return rename ? rename.message.slice(prefix.length) : null;
}

export function getAutoPrintText(event: LatestAutoPrintStatus | null): string | null {
  if (!event) return null;
  const stages = getPipeline(event);
  if (stages.readiness.status !== "complete" || stages.exclusions.status !== "complete") return null;
  return getRenamedText(event) ?? event.text;
}

export function getAutoPrintPreview(event: LatestAutoPrintStatus | null) {
  if (!event) return { text: "123-47", caption: "Пример оформления" };
  const renamed = getRenamedText(event);
  if (renamed) return { text: renamed, caption: "Переименовано" };
  const text = getAutoPrintText(event);
  return { text, caption: text !== null ? "Полученный текст" : "Ожидание проверки задания" };
}

interface AutoPrintOptions {
  idNum: boolean;
  endLine: boolean;
  hybrid: boolean;
  expand: number | string;
  bold: boolean;
}

// Keep these rules aligned with backend/app/domain/label_layout.py.
export function prepareAutoPrintLabel(text: string, options: AutoPrintOptions) {
  const sep = text.indexOf("-");
  const main = sep === -1 ? text : text.slice(0, sep);
  const header = sep === -1 ? "" : text.slice(sep + 1);
  const shelf = main.toUpperCase() === "П" && /^\d+$/.test(header);

  // Нормализуем порог гибридного формата: минимум 1
  const expandNum = Number.isFinite(Number(options.expand)) && Number(options.expand) > 0
    ? Number(options.expand)
    : 1;

  // Гибрид применяем только если есть вторая часть (header), иначе не меняем местами
  const canSwap = options.hybrid && header.trim().length > 0 && /^\d+$/.test(main) && Number(main) >= expandNum;
  const emphasized = canSwap || (main.toUpperCase() === "КГТ");

  const showHeader = !shelf && (emphasized || (Boolean(header) && options.idNum));
  const rawHeader = emphasized ? main : header;
  let mainText = shelf ? `П-${header}` : emphasized ? header : main;

  // Если «подчёркивание» выключено — добавляем точку к основному тексту (историческое правило макета)
  if (!options.endLine && !shelf) mainText += ".";

  return {
    mainText,
    headerText: showHeader && rawHeader ? (emphasized ? `${rawHeader}-` : `-${rawHeader}`) : "",
    headerLeft: !shelf && emphasized,
    bold: options.bold || emphasized,
    underline: shelf ? false : options.endLine,
  };
}
