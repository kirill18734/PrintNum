import type { LabelContentType } from "@/types/label";

export interface GeneratedCodeImage {
  image: string;
  svg: string;
}

/** Generates both preview SVG and printer PNG for one code value. */
export async function generateCodeImage(
  contentType: Exclude<LabelContentType, "text">,
  content: string,
): Promise<GeneratedCodeImage> {
  const bwipjs = await import("bwip-js/browser");
  const bcid =
    contentType === "barcode"
      ? "code128"
      : contentType === "qr"
        ? "qrcode"
        : "datamatrix";
  const options = {
    bcid,
    text: content,
    scale: 3,
    padding: 0,
    backgroundcolor: "FFFFFF",
    barcolor: "000000",
  };
  const svg = bwipjs.toSVG(options);
  const canvas = document.createElement("canvas");
  bwipjs.toCanvas(canvas, options);

  return {
    svg,
    image: canvas.toDataURL("image/png").split(",")[1],
  };
}
