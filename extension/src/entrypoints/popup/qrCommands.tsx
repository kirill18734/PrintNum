declare const chrome: any;

import { SettingSection } from "./SettingSection";
import { Ban, QrCode } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Printer } from "lucide-react";
import { UniversalLinkButton } from "@/components/opeTabURL";

export default function QrCommands() {
  // Предполагается, что useStorageState объявлен выше или импортирован
  const [qrCodes, setQrCodes] = useStorageState("qrCodes", []);
  const [offQrCodes, setOffQrId] = useStorageState("offQrCodes", []);

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
