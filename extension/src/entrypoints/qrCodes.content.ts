import { createQrCommandHandler } from "@/features/qr-automation/run-command";
import { listening } from "@/utils/listener";

export default defineContentScript({
  matches: ["https://turbo-pvz.ozon.ru/*"],

  main() {
    listening(createQrCommandHandler());
  },
});
