export default function PreviewPaper({ idNum, endLine, hybrid, expand }: any) {
  return (
    <div data-tauri-drag-region className="flex gap-4 w-full">
      <div className="flex flex-col items-center gap-1 p-1">
        {hybrid && (
          <span className="text-xs text-muted-foreground">
            Этикетки 1 – {expand - 1 < 1 ? expand : expand - 1}
          </span>
        )}

        <div
          className="flex flex-col justify-center items-center
          w-20 h-14 p-1 rounded-lg
          border border-border
          bg-white text-black shadow-sm font-[Arial]"
        >
          {idNum && (
            <div className="flex justify-end items-center w-full text-right align-center  h-[0.5rem]">
              <span className="text-[0.6rem]">−47</span>
            </div>
          )}

          <div className="flex justify-center items-center  leading-none flex-1 ">
            <span
              className={`text-4xl font-bold ${endLine && "underline  decoration-3"}`}
            >
              123{!endLine && "."}
            </span>
          </div>
        </div>
      </div>

      {hybrid && (
        <div className="flex flex-col items-center gap-1 p-1">
          <span className="text-xs text-muted-foreground">
            Этикетки от {expand}
          </span>

          <div
            className="flex flex-col justify-around items-center
            w-20 h-14 p-1 rounded-lg
            border border-border
            bg-white text-black shadow-sm font-[Arial]"
          >
            <div className="flex justify-start items-center w-full text-right align-center  h-[0.5rem]">
              <span className="text-[0.6rem]">{expand}−</span>
            </div>
            <div className="flex justify-center items-center  leading-none flex-1 ">
              <span
                className={`text-4xl font-bold ${endLine ? "underline  decoration-3" : ""}`}
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
