import { useRef, useState } from "react";
import { backendClient } from "@/shared/api/backendClient";
import type { LabelContentType } from "@/types/label";

interface UseLabelPrintingOptions {
  contentType: LabelContentType;
  content: string;
  codeImage: string;
  isSequenceMode: boolean;
  sequenceValues: string[];
}

/** Управляет одиночной и последовательной печатью этикеток. */
export function useLabelPrinting({
  contentType,
  content,
  codeImage,
  isSequenceMode,
  sequenceValues,
}: UseLabelPrintingOptions) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPrintingItem, setCurrentPrintingItem] = useState("");
  const stopPrinting = useRef(false);

  const startPrinting = async () => {
    if (!isSequenceMode && !content) return;
    if (isSequenceMode && !sequenceValues.length) return;

    setIsPrinting(true);
    setCurrentPrintingItem("");
    stopPrinting.current = false;

    try {
      if (!isSequenceMode) {
        const response = await backendClient.printLabel({
          contentType,
          content,
          codeImage: codeImage || undefined,
        });

        if (!response.status) {
          console.error("Backend не подтвердил отправку этикетки на печать");
        }
      } else {
        for (const item of sequenceValues) {
          if (stopPrinting.current) {
            console.log("Печать остановлена пользователем");
            break;
          }

          setCurrentPrintingItem(item);

          const response = await backendClient.printLabel({
            contentType,
            content: item,
          });

          // Backend возвращает { status: true } при успешной отправке.
          if (!response.status) {
            console.error("Печать последовательности остановлена: backend вернул status=false");
            break;
          }
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
