export interface StorageSchema {
  isInitialized: boolean;
  qrCodes: string[];
  offQrCodes: string[];
  packageCycleIndex: number;
}

export type StorageKey = keyof StorageSchema;
export type StorageValue<Key extends StorageKey> = StorageSchema[Key];
export type StorageArrayKey = {
  [Key in StorageKey]: StorageValue<Key> extends string[] ? Key : never;
}[StorageKey];

export function isStorageValue<Key extends StorageKey>(
  key: Key,
  value: unknown,
): value is StorageValue<Key> {
  switch (key) {
    case "isInitialized":
      return typeof value === "boolean";
    case "qrCodes":
    case "offQrCodes":
      return (
        Array.isArray(value) &&
        value.every((item: unknown) => typeof item === "string")
      );
    case "packageCycleIndex":
      return typeof value === "number" && Number.isFinite(value);
    default:
      return false;
  }
}
