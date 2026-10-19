export type QrCommandGroup =
  | "issue_all"
  | "issue_order"
  | "pay_order"
  | "recommendation"
  | "package_radio"
  | "package_cycle";

export interface QrCommand {
  id: string;
  code: string;
  name: string;
  path: string;
  actions: string[];
  group: QrCommandGroup;
  isLoop: boolean;
}
