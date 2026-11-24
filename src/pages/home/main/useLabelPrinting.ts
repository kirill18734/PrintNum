import { useRef, useState } from "react";
import { backendClient } from "@/shared/api/backendClient";
import { parseNonEmptyLines } from "@/lib/parse-non-empty-lines";
import { generateCodeImage } from "@/shared/utils/generateCodeImage";
import type { LabelContentType } from "@/types/label";

interface UseLabelPrintingOptions {
  contentType: LabelContentType;
  content: string;
  codeImage: string;
  isSequenceMode: boolean;
  sequenceValues: string[];
  bold: boolean;
  underline: boolean;
  showCodeText: boolean;
}

/** Manages single-label and multi-value sequential printing. */
export function useLabelPrinting({
  contentType,
  content,
  codeImage,
  isSequenceMode,
  sequenceValues,
  bold,
  underline,
  showCodeText,
}: UseLabelPrintingOptions) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPrintingItem, setCurrentPrintingItem] = useState("");
  const stopPrinting = useRef(false);

  const startPrinting = async () => {
    const values = isSequenceMode
      ? sequenceValues
      : parseNonEmptyLines(content);

    if (!values.length) return;
    if (contentType !== "text" && !codeImage) return;

    setIsPrinting(true);
    setCurrentPrintingItem("");
    stopPrinting.current = false;

    try {
      for (let index = 0; index < values.length; index += 1) {
        if (stopPrinting.current) {
          console.log("Печать остановлена пользователем");
          break;
        }

        const item = values[index];
        setCurrentPrintingItem(item);

        try {
          // The preview-generated image is reusable only for the first input value.
          // Every following value receives its own freshly generated code image.
          const itemCodeImage =
            contentType === "text"
              ? undefined
              : index === 0 && !isSequenceMode
                ? codeImage
                : (await generateCodeImage(contentType, item)).image;

          if (stopPrinting.current) break;

          const response = await backendClient.printLabel({
            contentType,
            content: item,
            codeImage: itemCodeImage,
            bold,
            underline,
            showCodeText,
          });

          if (!response.status) {
            console.error(`Backend не подтвердил отправку значения "${item}"`);
          }
        } catch (error) {
          console.error(`Не удалось подготовить или отправить значение "${item}"`, error);
        }
      }
    } catch (error) {
      console.error("Ошибка при отправке на печать:", error);
    } finally {
      setIsPrinting(false);
      stopPrinting.current = false;
      setCurrentPrintingItem("");
    }
  };

  const stopSequencePrinting = () => {
    stopPrinting.current = true;
  };

  return {
    isPrinting,
    currentPrintingItem,
    startPrinting,
    stopSequencePrinting,
  };
}
