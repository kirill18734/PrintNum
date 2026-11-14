import type { FontItem } from "@/types/api";

const STYLE_ATTRIBUTE = "data-printnum-font";
const registeredStyles = new Map<string, HTMLStyleElement>();

function getFontFamily(font: FontItem): string {
  return font.family?.trim() || font.name.trim();
}

function getFontWeight(weight: number | undefined): number {
  if (typeof weight !== "number" || !Number.isFinite(weight)) {
    return 400;
  }

  return Math.min(1000, Math.max(1, Math.round(weight)));
}

function createFontFaceRule(font: FontItem): string | null {
  const base64 = font.base64?.trim();
  const family = getFontFamily(font);

  if (!font.id || !base64 || !family) {
    return null;
  }

  const format = font.format ?? "truetype";
  const mimeType = format === "opentype" ? "font/otf" : "font/ttf";
  const source = base64.startsWith("data:")
    ? base64
    : `data:${mimeType};base64,${base64}`;

  // JSON.stringify экранирует кавычки и обратные слеши в имени семейства.
  return `@font-face {
    font-family: ${JSON.stringify(family)};
    src: url(${JSON.stringify(source)}) format("${format}");
    font-weight: ${getFontWeight(font.weight)};
    font-style: ${font.fontStyle === "italic" ? "italic" : "normal"};
    font-display: swap;
  }`;
}

/**
 * Синхронизирует CSS @font-face с актуальным списком backend.
 * Повторные вызовы не создают дубликаты и обновляют только изменившиеся правила.
 */
export function syncFontStyles(fonts: FontItem[]): void {
  const activeIds = new Set<string>();

  for (const font of fonts) {
    const rule = createFontFaceRule(font);

    if (!rule) {
      continue;
    }

    activeIds.add(font.id);

    let style = registeredStyles.get(font.id);

    if (!style || !style.isConnected) {
      style = document.createElement("style");
      style.dataset.printnumFont = font.id;
      document.head.appendChild(style);
      registeredStyles.set(font.id, style);
    }

    if (style.textContent !== rule) {
      style.textContent = rule;
    }
  }

  // Удаляем стили шрифтов, которых больше нет в актуальном ответе backend.
  for (const [fontId, style] of registeredStyles) {
    if (!activeIds.has(fontId)) {
      style.remove();
      registeredStyles.delete(fontId);
    }
  }
}
