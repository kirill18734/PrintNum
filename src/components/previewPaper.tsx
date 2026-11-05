interface PreviewPaperProps {
  idNum: boolean;
  endLine: boolean;
  hybrid: boolean;
  expand: number;
  bold: boolean;
  /** Размер бумаги в формате "ширина*высота", например "30*20" или "58*40" */
  paper: string;
}

export default function PreviewPaper({
  idNum,
  endLine,
  hybrid,
  expand,
  bold,
  paper,
}: PreviewPaperProps) {
  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-center w-full h-full gap-2 p-2"
    >
      {/* 1 этикетка */}
      <div className="flex flex-col items-center justify-center h-full flex-1 w-0">
        {hybrid ? (
          <span className="text-xs text-muted-foreground h-4 leading-4 block shrink-0">
            Этикетки 1 – {expand - 1 < 1 ? expand : expand - 1}
          </span>
        ) : (
          /* Пустая заглушка-распорка, чтобы высота превью не менялась при переключении гибридного режима */
          <div className="h-4 shrink-0" />
        )}

        {/* preview */}
        <div className="flex-1 h-0 w-full flex flex-col justify-center items-center">
          <div
            className="flex flex-col justify-between items-center
            w-full h-full scale-[0.8] p-4 rounded-lg
            border border-border
            bg-white text-black shadow-sm font-[Arial]"
          >
            {/* Верхняя панель фиксированной высоты (резервирует место, даже если idNum = false) */}
            <div className="flex justify-end w-full h-9 items-center shrink-0">
              {idNum && <span className="text-3xl leading-none">−47</span>}
            </div>

            {/* Контентная зона занимает всё оставшееся пространство */}
            <div className="flex justify-center items-center flex-1 min-h-0 w-full">
              <span
                className={`text-8xl leading-none ${endLine && "underline decoration-5"} ${bold && "font-bold"}`}
              >
                123{!endLine && "."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 этикетка */}
      {hybrid && (
        <div className="flex flex-col items-center justify-center h-full flex-1 w-0">
          <span className="text-xs text-muted-foreground h-4 leading-4 block shrink-0">
            Этикетки от {expand}
          </span>

          {/* preview */}
          <div className="flex-1 h-0 w-full flex flex-col justify-center items-center">
            <div
              className="flex flex-col justify-between items-center
              w-full h-full scale-[0.8] p-4 rounded-lg
              border border-border
              bg-white text-black shadow-sm font-[Arial]"
            >
              {/* Верхняя панель для выравнивания высоты со второй этикеткой */}
              <div className="flex justify-end items-center w-full text-right h-9 shrink-0">
                <span className="text-3xl leading-none">{expand}−</span>
              </div>

              <div className="flex justify-center items-center flex-1 min-h-0 w-full">
                <span
                  className={`text-8xl leading-none font-bold ${endLine && "underline decoration-5"}`}
                >
                  123{!endLine && "."}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
