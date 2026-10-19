import { SettingSection } from "./SettingSection";
import { Ban, QrCode } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Printer } from "lucide-react";
import { UniversalLinkButton } from "@/components/opeTabURL";
import { useStorageState } from "@/hooks/useStorageState";

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
        <SettingSection
          value="qr-settings"
          title="Обработчики QR-кодов"
          items={qrCodes}
          hiddenItems={offQrCodes}
          onItemToggle={setOffQrId}
          toggleAllLabel={shouldEnableAll ? "Включить все" : "Выключить все"}
          onToggleAll={() => setOffQrCodes(shouldEnableAll ? [] : qrCodes)}
          VisibleIcon={QrCode}
          HiddenIcon={Ban}
        />
      </Accordion>
      {/* Передаем пропс fileUrl, который вы указали в вызове */}
      <UniversalLinkButton
        fileUrl="/qrCodes.pdf"
        icon={Printer}
        variant="ghost"
      />
    </div>
  );
}
