/**
 * Splits multiline label input into printable lines.
 *
 * Line endings (LF, CRLF, and CR) are normalized by splitting on them.
 * Blank and whitespace-only lines are skipped, while the original contents
 * and order of every non-empty line are preserved.
 */
export function parseNonEmptyLines(value: string): string[] {
  return value
    .split(/\r\n?|\n/)
    .filter((line) => line.trim().length > 0);
}
