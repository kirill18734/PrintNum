// Генерирует графику кодов и отправляет запрос на печать этикетки.
import { useRef, useState } from "react";
import type { ManualPrintJob } from "./types";
import { backendClient } from "@/shared/api/backendClient";
import type { LabelContentType } from "@/components/LabelStudio";

interface PrintLabelOptions {
  contentType: LabelContentType;
  content: string;
  bold: boolean;
  underline: boolean;
  showCodeText: boolean;
}

export function useLabelPrinting() {
  const [manualJob, setManualJob] = useState<ManualPrintJob | null>(null);
  const printing = useRef(false);

  const printLabel = async ({
    contentType,
    content,
    bold,
    underline,
    showCodeText,
  }: PrintLabelOptions) => {
    if (!content.trim() || printing.current) return;

    printing.current = true;
    const job: ManualPrintJob = {
      startedAt: Date.now(), content, status: "processing", message: "Отправка этикетки…",
    };
    setManualJob(job);
    try {
      let codeImage: string | undefined;
      if (contentType !== "text") {
        const bwipjs = await import("bwip-js/browser");
        const canvas = document.createElement("canvas");
        const bcid =
          contentType === "barcode"
            ? "code128"
            : contentType === "qr"
              ? "qrcode"
              : "datamatrix";
        bwipjs.toCanvas(canvas, {
          bcid,
          text: content,
          scale: 3,
          padding: 0,
          backgroundcolor: "FFFFFF",
          barcolor: "000000",
        });
        codeImage = canvas.toDataURL("image/png").split(",")[1];
      }

      await backendClient.printLabel({
        contentType,
        content,
        codeImage,
        bold,
        underline,
        showCodeText,
      });
      setManualJob({ ...job, status: "printed", message: "Успешно отправлено на печать" });
    } catch (error) {
      console.error("Не удалось напечатать этикетку:", error);
      setManualJob({
        ...job,
        status: "error",
        message: error instanceof Error ? error.message : "Не удалось напечатать этикетку",
      });
    } finally {
      printing.current = false;
    }
  };

  return { isPrinting: manualJob?.status === "processing", manualJob, printLabel };
}
