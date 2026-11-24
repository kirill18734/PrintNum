import * as React from "react";
import { cn } from "cn";

type LineNumberedTextareaProps = React.ComponentProps<"textarea">;

function LineNumberedTextarea({
  className,
  onScroll,
  value,
  defaultValue,
  ...props
}: LineNumberedTextareaProps) {
  const gutterRef = React.useRef<HTMLDivElement>(null);
  const text = String(value ?? defaultValue ?? "");
  const lineCount = text.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1);
  const gutterWidth = `${Math.max(2, String(lineCount).length) + 1}ch`;

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = event.currentTarget.scrollTop;
    }

    onScroll?.(event);
  };

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 overflow-hidden rounded-md border border-input bg-background transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="flex-none overflow-hidden border-r border-border/60 bg-muted/30 text-right text-xs leading-4 text-muted-foreground select-none"
        style={{ width: gutterWidth }}
      >
        <div className="flex flex-col px-2 py-2">
          {lineNumbers.map((lineNumber) => (
            <div key={lineNumber} className="h-4 shrink-0">
              {lineNumber}
            </div>
          ))}
        </div>
      </div>

      <textarea
        {...props}
        value={value}
        defaultValue={defaultValue}
        wrap="off"
        onScroll={handleScroll}
        className={cn(
          className,
          "h-full min-h-0 w-auto min-w-0 flex-1 resize-none overflow-y-auto rounded-none border-0 bg-transparent text-xs leading-4 outline-none focus-visible:border-0 focus-visible:ring-0"
        )}
      />
    </div>
  );
}

export { LineNumberedTextarea };
