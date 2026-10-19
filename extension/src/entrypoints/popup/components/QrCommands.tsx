import { Ban, QrCode, Printer } from "lucide-react";
import { Accordion } from "../ui/accordion";
import { UniversalLinkButton } from "../ui/openTabURL";
import { useStorageState } from "@/hooks/useStorageState";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

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
        <div className="px-4 pb-3 pt-0 flex flex-col gap-1.5">
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

          {qrCodes.map((element) => {
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
      </Accordion>
      <UniversalLinkButton
        fileUrl="/qrCodes.pdf"
        icon={Printer}
        variant="ghost"
      />
    </div>
  );
}
