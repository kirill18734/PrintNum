type ParsedSequence =
  | {
      type: "numeric";
      start: number;
      end: number;
      width: number;
      letterPrefix: "";
      lowercase: false;
    }
  | {
      type: "letters";
      start: number;
      end: number;
      width: 0;
      letterPrefix: "";
      lowercase: boolean;
    }
  | {
      type: "mixed";
      start: number;
      end: number;
      width: number;
      letterPrefix: string;
      lowercase: boolean;
    }
  | null;

function lettersToNumber(value: string): number {
  let result = 0;

  for (const char of value.toUpperCase()) {
    const code = char.charCodeAt(0);

    if (code < 65 || code > 90) return -1;

    result = result * 26 + code - 64;

    if (!Number.isSafeInteger(result)) return -1;
  }

  return result;
}

// Автоматическое определение формата последовательности
export function parseSequence(start: string, end: string): ParsedSequence {
  const firstValue = start.trim();
  const lastValue = end.trim();

  if (!firstValue || !lastValue) return null;

  // Числовая последовательность: 001 -> 030
  if (/^\d+$/.test(firstValue) && /^\d+$/.test(lastValue)) {
    const first = Number(firstValue);
    const last = Number(lastValue);

    if (
      !Number.isSafeInteger(first) ||
      !Number.isSafeInteger(last) ||
      first < 1 ||
      last < 1
    ) {
      return null;
    }

    return {
      type: "numeric",
      start: first,
      end: last,
      width:
        firstValue.length > 1 && firstValue.startsWith("0")
          ? firstValue.length
          : 0,
      letterPrefix: "",
      lowercase: false,
    };
  }

  // Буквенная последовательность: A -> Z, AA -> AZ
  if (/^[a-z]+$/i.test(firstValue) && /^[a-z]+$/i.test(lastValue)) {
    const first = lettersToNumber(firstValue);
    const last = lettersToNumber(lastValue);

    if (first < 1 || last < 1) return null;

    return {
      type: "letters",
      start: first,
      end: last,
      width: 0,
      letterPrefix: "",
      lowercase: firstValue === firstValue.toLowerCase(),
    };
  }

  // Буквенно-числовая последовательность: A001 -> A030
  const startMatch = firstValue.match(/^([a-z]+)(\d+)$/i);
  const endMatch = lastValue.match(/^([a-z]+)(\d+)$/i);

  if (startMatch && endMatch) {
    const startPrefix = startMatch[1];
    const endPrefix = endMatch[1];

    if (startPrefix.toUpperCase() !== endPrefix.toUpperCase()) {
      return null;
    }

    const first = Number(startMatch[2]);
    const last = Number(endMatch[2]);

    if (
      !Number.isSafeInteger(first) ||
      !Number.isSafeInteger(last) ||
      first < 1 ||
      last < 1
    ) {
      return null;
    }

    return {
      type: "mixed",
      start: first,
      end: last,
      width:
        startMatch[2].length > 1 && startMatch[2].startsWith("0")
          ? startMatch[2].length
          : 0,
      letterPrefix: startPrefix,
      lowercase: startPrefix === startPrefix.toLowerCase(),
    };
  }

  return null;
}
