import { useRef, useState } from "react";
import { backendClient } from "@/shared/api/backendClient";
import { parseNonEmptyLines } from "@/lib/parse-non-empty-lines";
import { generateCodeImage } from "@/shared/utils/generateCodeImage";
import type { LabelContentType } from "@/types/label";

interface UseLabelPrintingOptions {
  contentType: LabelContentType;
  content: string;
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
    setIsPrinting(true);
    setCurrentPrintingItem("");
    stopPrinting.current = false;

    try {
      for (const item of values) {
        if (stopPrinting.current) {
          console.log("Печать остановлена пользователем");
          break;
        }

        setCurrentPrintingItem(item);

        try {
          // Generate a fresh image for each code value. Printing must not depend
          // on whether the asynchronous preview image has finished generating.
          const itemCodeImage =
            contentType === "text"
              ? undefined
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
            console.error(`Backend не подтвердил отправку значения "${item}". Очередь остановлена.`);
            break;
          }
        } catch (error) {
          console.error(`Не удалось подготовить или отправить значение "${item}". Очередь остановлена.`, error);
          break;
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
