import type { LabelContentType } from "@/types/label";

/** Generates a PNG image (base64 without data URL prefix) for one code value. */
export async function generateCodeImage(
  contentType: Exclude<LabelContentType, "text">,
  content: string,
): Promise<string> {
  const bwipjs = await import("bwip-js/browser");
  const bcid =
    contentType === "barcode"
      ? "code128"
      : contentType === "qr"
        ? "qrcode"
        : "datamatrix";
  const canvas = document.createElement("canvas");

  bwipjs.toCanvas(canvas, {
    bcid,
    text: content,
    scale: 3,
    padding: 0,
    backgroundcolor: "FFFFFF",
    barcolor: "000000",
  });

  return canvas.toDataURL("image/png").split(",")[1];
}
