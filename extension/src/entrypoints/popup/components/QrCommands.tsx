import { Ban, QrCode, Printer } from "lucide-react";
import { Accordion } from "../ui/accordion";
import { UniversalLinkButton } from "../ui/openTabURL";
import { useStorageState } from "@/hooks/useStorageState";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { qrCodes as ALL_QR } from "@/shared/constants";
import type { QrCommandGroup } from "@/shared/types/qr-command";

function SettingRow({
  label,
  isHidden,
  onToggle,
  VisibleIcon,
  HiddenIcon,
}: {
  label: string;
  isHidden: boolean;
  onToggle: () => void;
  VisibleIcon: LucideIcon;
  HiddenIcon: LucideIcon;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onToggle}
      title={isHidden ? "Отключено" : "Включено"}
      className={cn(
        "flex w-full items-center justify-start gap-3 p-2.5 h-auto rounded-lg border text-left font-normal transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isHidden
          ? "bg-muted/40 border-muted text-muted-foreground/60 hover:bg-muted/60"
          : "bg-background border-border shadow-sm text-foreground hover:bg-muted/40 hover:border-border/80",
      )}
    >
      <div className="flex items-center justify-center shrink-0">
        {isHidden ? (
          <HiddenIcon className="h-4 w-4 text-muted-foreground/50" />
        ) : (
          <VisibleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
        )}
      </div>
      <span
        className={cn(
          "text-xs font-medium truncate select-none",
          isHidden && "line-through opacity-60",
        )}
      >
        {label}
      </span>
    </Button>
  );
}

export default function QrCommands() {
  const [qrCodes, setQrCodes] = useStorageState("qrCodes", []);
  const [offQrCodes, setOffQrId, setOffQrCodes] = useStorageState(
    "offQrCodes",
    [],
  );
  const disabledQrCodesCount = qrCodes.filter((code) =>
    offQrCodes.includes(code),
  ).length;
  const shouldEnableAll = disabledQrCodesCount > qrCodes.length / 2;

  // Сопоставление name -> group из списка команд
  const nameToGroup = new Map<string, QrCommandGroup>();
  for (const c of ALL_QR) nameToGroup.set(c.name, c.group);

  // Заголовки групп и порядок отображения
  const GROUP_LABELS: Record<QrCommandGroup | "other", string> = {
    issue_all: "Выдача всех заказов (оплаченных)",
    issue_order: "Выдача заказа",
    pay_order: "Оплата заказа",
    recommendation: "Приемка",
    package_radio: "Выбор упаковки",
    package_cycle: "Автоматическая выдача (автовыбор пакета)",
    other: "Прочее",
  };
  const ORDER: Array<QrCommandGroup | "other"> = [
    "issue_all",
    "issue_order",
    "pay_order",
    "recommendation",
    "package_radio",
    "package_cycle",
    "other",
  ];

  // Группируем видимые названия по группе
  const grouped = new Map<QrCommandGroup | "other", string[]>();
  for (const name of qrCodes) {
    const group = nameToGroup.get(name) ?? "other";
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)!.push(name);
  }

  return (
    <div className="bg-background flex items-start justify-between gap-1 w-full">
      <Accordion
        type="single"
        collapsible
        className="border rounded-xl bg-background overflow-hidden w-full"
      >
        <div className="px-4 py-3 text-xs font-semibold text-muted-foreground">
          Обработчики QR-кодов
        </div>
        <div className="px-4 pb-3 pt-0 flex flex-col gap-3">
          {qrCodes.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOffQrCodes(shouldEnableAll ? [] : qrCodes)}
              className="w-full h-auto rounded-lg py-2 text-xs"
            >
              {shouldEnableAll ? "Включить все" : "Выключить все"}
            </Button>
          )}

          {ORDER.map((key) => {
            const items = grouped.get(key) ?? [];
            if (items.length === 0) return null;
            const groupAllOff = items.every((name) =>
              offQrCodes.includes(name),
            );
            const toggleLabel = groupAllOff ? "Включить все" : "Выключить все";
            const onToggleGroup = () => {
              setOffQrCodes((prev) => {
                if (groupAllOff) {
                  // Включить все в группе: удалить элементы группы из off
                  return prev.filter((n) => !items.includes(n));
                }
                // Выключить все в группе: добавить все элементы группы в off (без дублей)
                const set = new Set(prev);
                items.forEach((n) => set.add(n));
                return Array.from(set);
              });
            };
            return (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    {GROUP_LABELS[key]}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-6 px-2 text-[10px]"
                    onClick={onToggleGroup}
                  >
                    {toggleLabel}
                  </Button>
                </div>
                {items.map((element) => {
                  const isHidden = offQrCodes.includes(element);
                  return (
                    <SettingRow
                      key={element}
                      label={element}
                      isHidden={isHidden}
                      onToggle={() => setOffQrId(element)}
                      VisibleIcon={QrCode}
                      HiddenIcon={Ban}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </Accordion>
      <UniversalLinkButton
        fileUrl="/qrCodes.pdf"
        icon={Printer}
        variant="ghost"
      />
    </div>
  );
}
