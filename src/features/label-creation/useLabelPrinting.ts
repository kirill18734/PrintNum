// Генерирует графику кодов и отправляет запрос на печать этикетки.
import { useState } from "react";
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
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  const printLabel = async ({
    contentType,
    content,
    bold,
    underline,
    showCodeText,
  }: PrintLabelOptions) => {
    if (!content.trim()) return;

    setIsPrinting(true);
    setPrintError(null);
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
    } catch (error) {
      console.error("Не удалось напечатать этикетку:", error);
      setPrintError(
        error instanceof Error
          ? error.message
          : "Не удалось напечатать этикетку",
      );
    } finally {
      setIsPrinting(false);
    }
  };

  return { isPrinting, printError, printLabel };
}
