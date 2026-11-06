interface PreviewPaperProps {
  idNum: boolean;
  endLine: boolean;
  hybrid: boolean;
  expand: number;
  bold: boolean;
  /** Размер бумаги в формате "ширина*высота" */
  paper: string;
}

export default function PreviewPaper({
  idNum,
  endLine,
  hybrid,
  expand,
  bold,
}: PreviewPaperProps) {
  const label = (
    <div
      className={`flex flex-col justify-center items-center
        ${hybrid ? "w-25 h-15 p-1.5" : "w-36 h-24 p-2"}
        rounded-lg border border-border
        bg-white text-black shadow-sm font-[Arial]`}
    >
      {idNum && (
        <div className="flex justify-end items-center w-full h-[0.5rem]">
          <span className="text-[0.6rem]">−47</span>
        </div>
      )}

      <div className="flex justify-center items-center leading-none flex-1">
        <span
          className={`${hybrid ? "text-4xl" : "text-6xl"}
            ${endLine ? "underline decoration-3" : ""}
            ${bold ? "font-bold" : ""}`}
        >
          123{!endLine && "."}
        </span>
      </div>
    </div>
  );

  return (
    <div
      data-tauri-drag-region
      className={`flex items-center w-full
        ${hybrid ? "justify-between gap-1" : "justify-center"}`}
    >
      {/* Первая этикетка */}
      <div className="flex flex-col items-center gap-1">
        {hybrid && (
          <span className="text-xs text-muted-foreground">
            Этикетки 1 – {expand - 1 < 1 ? expand : expand - 1}
          </span>
        )}

        {label}
      </div>

      {/* Вторая этикетка — только в гибридном режиме */}
      {hybrid && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">
            Этикетки от {expand}
          </span>

          <div
            className="flex flex-col justify-center items-center
              w-25 h-15 p-1.5 rounded-lg
              border border-border
              bg-white text-black shadow-sm font-[Arial]"
          >
            <div className="flex justify-start items-center w-full h-[0.5rem]">
              <span className="text-[0.6rem]">{expand}−</span>
            </div>

            <div className="flex justify-center items-center leading-none flex-1">
              <span
                className={`text-4xl font-bold
                  ${endLine ? "underline decoration-3" : ""}`}
              >
                123{!endLine && "."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
