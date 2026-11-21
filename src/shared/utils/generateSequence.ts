import { parseSequence } from "@/shared/utils/parseElem";
import type { SequenceConfig } from "@/types/label";

export interface SequenceResult {
  values: string[];
  error: string | null;
}

function numberToLetters(value: number): string {
  let result = "";

  while (value > 0) {
    value--;

    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }

  return result;
}

/** Формирует значения последовательности для печати этикеток. */
export function generateSequence(
  sequence: SequenceConfig,
): SequenceResult {
  const { start, end, step, prefix, suffix } = sequence;
  const stepValue = Number(step);

  if (!step.trim() || !Number.isSafeInteger(stepValue) || stepValue < 1) {
    return {
      values: [],
      error: "Шаг должен быть целым числом не меньше 1",
    };
  }

  const parsed = parseSequence(start, end);

  if (!parsed) {
    return {
      values: [],
      error: "Проверьте начальное и конечное значения",
    };
  }

  const direction = parsed.start <= parsed.end ? 1 : -1;
  const count =
    Math.floor(Math.abs(parsed.end - parsed.start) / stepValue) + 1;

  if (count > 10000) {
    return {
      values: [],
      error: "Слишком много значений (максимум 10 000)",
    };
  }

  const values = Array.from({ length: count }, (_, index) => {
    const current = parsed.start + index * stepValue * direction;
    let value: string;

    if (parsed.type === "numeric") {
      value = String(current).padStart(parsed.width, "0");
    } else if (parsed.type === "letters") {
      value = numberToLetters(current);

      if (parsed.lowercase) {
        value = value.toLowerCase();
      }
    } else {
      const number = String(current).padStart(parsed.width, "0");
      const letterPrefix = parsed.lowercase
        ? parsed.letterPrefix.toLowerCase()
        : parsed.letterPrefix.toUpperCase();

      value = `${letterPrefix}${number}`;
    }

    return `${prefix}${value}${suffix}`;
  });

  return { values, error: null };
}
