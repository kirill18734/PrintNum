interface SequencePrintOptions {
  values: string[];

  print: (value: string) => Promise<PrintResponse>;

  onProgress?: (current: number, total: number) => void;
}

interface PrintResponse {
  success: boolean;
  message?: string;
}

export async function printSequence({
  values,
  print,
  onProgress,
}: SequencePrintOptions) {
  for (let index = 0; index < values.length; index++) {
    const value = values[index];

    onProgress?.(index + 1, values.length);

    const response = await print(value);

    // Проверяем корректность ответа
    if (
      !response ||
      typeof response !== "object" ||
      response.success !== true
    ) {
      throw new Error(response?.message || `Ошибка печати значения: ${value}`);
    }
  }

  return {
    success: true,
    total: values.length,
  };
}
