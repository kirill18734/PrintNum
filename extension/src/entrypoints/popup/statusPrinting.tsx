import { useEffect, useState } from "react";
import { sendServer } from "@/shared/api/client";
import { openUrl } from "./ui/openTabURL";

const RELEASE_MANIFEST_URLS = [
  "https://printnum.s3.cloud.ru/latest.json",
  "https://raw.githubusercontent.com/kirill18734/printnum/main/latest.json",
];

async function getWindowsDownloadUrl(
  manifestUrl: string,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(manifestUrl, { signal });

  if (!response.ok) {
    throw new Error(
      `Запрос latest.json завершился с HTTP-статусом ${response.status}`,
    );
  }

  const data: unknown = await response.json();
  if (
    typeof data !== "object" ||
    data === null ||
    !("platforms" in data) ||
    typeof (data as any).platforms !== "object" ||
    (data as any).platforms === null ||
    !("windows-x86_64" in (data as any).platforms) ||
    typeof (data as any).platforms["windows-x86_64"] !== "object" ||
    (data as any).platforms["windows-x86_64"] === null ||
    !("url" in (data as any).platforms["windows-x86_64"]) ||
    typeof (data as any).platforms["windows-x86_64"].url !== "string" ||
    (data as any).platforms["windows-x86_64"].url.length === 0
  ) {
    throw new Error("В latest.json отсутствует ссылка на установщик Windows");
  }

  return (data as any).platforms["windows-x86_64"].url;
}

export default function StatusPrinting() {
  const [isActive, setIsActive] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadClicked, setDownloadClicked] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await sendServer.get();
        setIsActive(!!res?.ok);
      } catch {
        setIsActive(false);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      try {
        try {
          const url = await getWindowsDownloadUrl(
            RELEASE_MANIFEST_URLS[0],
            controller.signal,
          );
          setDownloadUrl(url);
          return;
        } catch (error) {
          console.warn(
            "Не удалось получить ссылку с Amvera, пробуем GitHub",
            error,
          );
        }

        const url = await getWindowsDownloadUrl(RELEASE_MANIFEST_URLS[1]);
        setDownloadUrl(url);
      } catch (e) {
        console.error("Не удалось получить ссылку на скачивание", e);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    if (!downloadClicked || !downloadUrl) {
      return;
    }

    void openUrl(downloadUrl).catch((error: unknown) =>
      console.error("Не удалось открыть ссылку для скачивания", error),
    );
  }, [downloadClicked, downloadUrl]);

  const handleDownload = () => {
    if (downloadClicked) {
      return;
    }
    setDownloadClicked(true);
  };

  return (
    <div
      className={`flex items-center p-3 gap-3 border mb-4 w-full ${
        isActive
          ? "bg-emerald-500/10 border-emerald-500/20"
          : "bg-red-500/10 border-red-500/20"
      }`}
    >
      <div className="relative flex h-3 w-3">
        {isActive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}

        <span
          className={`relative inline-flex rounded-full h-3 w-3 ${
            isActive ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
      </div>

      <div className="flex flex-col">
        <span
          className={`font-bold text-sm tracking-wide ${
            isActive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isActive ? "Печать активна" : "Печать не активна"}
        </span>

        <span
          className={`text-xs ${
            isActive
              ? "text-emerald-600/80 dark:text-emerald-400/80"
              : "text-red-600/80 dark:text-red-400/80"
          }`}
        >
          {isActive ? (
            "Сервис печати работает"
          ) : (
            <>
              Проверьте, что приложение PrintNum запущено или {""}
              {downloadClicked ? (
                <span className="font-medium text-gray-500">
                  скачивание началось...
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline p-0 m-0 border-0 bg-transparent font-medium text-blue-600 hover:text-blue-700 underline cursor-pointer"
                >
                  скачайте PrintNum
                </button>
              )}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
