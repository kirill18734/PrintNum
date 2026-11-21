/** Статусы задания печати, которые приходят от backend. */
export type LatestTextStatus =
  | "waiting"
  | "processing"
  | "printed"
  | "excluded"
  | "printer_unavailable"
  | "print_error";

/** Данные задания печати, используемые хранилищем и UI. */
export interface StatusCardProps {
  status: LatestTextStatus;
  text?: string | null;
  renameText?: string | null;
  receivedAt?: Date | string | null;
}
