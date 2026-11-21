/** Тип содержимого, которое можно разместить на этикетке. */
export type LabelContentType = "text" | "barcode" | "qr" | "datamatrix";


/** Режим ввода текстовой этикетки. */
export type TextInputMode = "single" | "sequence";

/** Настройки генерации последовательности значений. */
export interface SequenceConfig {
  start: string;
  end: string;
  step: string;
  prefix: string;
  suffix: string;
}

/** Поля конфигурации последовательности, которые можно редактировать. */
export type SequenceConfigKey = keyof SequenceConfig;
