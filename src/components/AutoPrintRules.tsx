// Интерфейс настройки текстовых исключений автопечати.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestedRules = [
  "Прямой поток",
  "Расходники",
  "Возвраты",
  "Продавцу",
];

interface AutoPrintRulesProps {
  rules: string[];
  onRulesChange: (rules: string[]) => void;
  running: boolean;
}

export default function AutoPrintRules({
  rules,
  onRulesChange,
  running,
}: AutoPrintRulesProps) {
  const [newRule, setNewRule] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const normalizedInput = newRule.trim().toLocaleLowerCase();
  const matchingSuggestions = suggestedRules.filter((suggestion) =>
    suggestion.toLocaleLowerCase().includes(normalizedInput),
  );
  const allSuggestionsSelected = suggestedRules.every((suggestion) =>
    rules.some((rule) => rule.toLocaleLowerCase() === suggestion.toLocaleLowerCase()),
  );

  const addRule = (ruleText = newRule) => {
    const value = ruleText.trim();
    if (
      !value ||
      rules.some(
        (rule) => rule.toLocaleLowerCase() === value.toLocaleLowerCase(),
      )
    ) {
      return;
    }

    onRulesChange([...rules, value]);
    if (ruleText === newRule) setNewRule("");
  };

  const toggleSuggestedRule = (suggestion: string) => {
    const isSelected = rules.some(
      (rule) => rule.toLocaleLowerCase() === suggestion.toLocaleLowerCase(),
    );

    onRulesChange(
      isSelected
        ? rules.filter(
            (rule) => rule.toLocaleLowerCase() !== suggestion.toLocaleLowerCase(),
          )
        : [...rules, suggestion],
    );
  };

  return (
    <section
      aria-labelledby="auto-print-rules-title"
      className={`w-full rounded-xl border p-2.5 ${
        rules.length
          ? "border-amber-500/40 bg-amber-500/[0.06] dark:bg-amber-500/[0.05]"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="auto-print-rules-title" className="text-sm font-semibold leading-tight">
          Исключения
        </h2>
        {rules.length > 0 && (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber-800 dark:text-amber-300">
            {running ? "Активны" : "Сохранены"} · {rules.length}
          </span>
        )}
      </div>

      {rules.length > 0 ? (
        <>
          <p className="mt-1 text-xs leading-snug text-amber-900 dark:text-amber-200">
            {running
              ? "Автопечать пропустит текст, содержащий:"
              : "При запуске автопечати будут пропускаться тексты с:"}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {rules.map((rule, index) => (
              <li
                key={`${rule}-${index}`}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-amber-500/40 bg-background/90 py-0.5 pl-2.5 pr-1 text-xs font-medium"
              >
                <span className="break-all">{rule}</span>
                <button
                  type="button"
                  aria-label={`Удалить исключение «${rule}»`}
                  onClick={() =>
                    onRulesChange(
                      rules.filter((_, ruleIndex) => ruleIndex !== index),
                    )
                  }
                  className="flex size-5 shrink-0 items-center justify-center rounded-full text-amber-800 transition-colors hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:text-amber-200"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-1 text-xs leading-snug text-muted-foreground">
          Исключений нет — автопечать не будет пропускать текст по правилам.
        </p>
      )}

      <div
        className="relative mt-2"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setSuggestionsOpen(false);
          }
        }}
      >
        <form
          className="flex gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            addRule();
          }}
        >
          <Input
            value={newRule}
            onFocus={() => setSuggestionsOpen(true)}
            onChange={(event) => {
              setNewRule(event.target.value);
              setSuggestionsOpen(true);
            }}
            placeholder="Добавить исключение"
            aria-label="Найти или добавить исключение"
            aria-expanded={suggestionsOpen}
            aria-controls="excluded-rule-suggestions"
            className="h-9 select-text text-sm"
          />
          <Button
            type="submit"
            variant="outline"
            className="h-9 shrink-0 rounded-lg text-xs"
          >
            Добавить
          </Button>
        </form>

        {suggestionsOpen && (
          <div
            id="excluded-rule-suggestions"
            className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
          >
            <div className="mb-1 flex items-center justify-between gap-2 px-1">
              <span className="text-xs font-semibold">
                Готовые исключения
              </span>
              <button
                type="button"
                disabled={allSuggestionsSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  const nextRules = [...rules];
                  for (const suggestion of suggestedRules) {
                    if (
                      !nextRules.some(
                        (rule) =>
                          rule.toLocaleLowerCase() ===
                          suggestion.toLocaleLowerCase(),
                      )
                    ) {
                      nextRules.push(suggestion);
                    }
                  }
                  onRulesChange(nextRules);
                }}
                className="rounded-sm text-[10px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:text-muted-foreground disabled:no-underline"
              >
                Добавить все
              </button>
            </div>
            <ul className="max-h-32 overflow-y-auto">
              {matchingSuggestions.map((suggestion) => {
                const selected = rules.some(
                  (rule) =>
                    rule.toLocaleLowerCase() === suggestion.toLocaleLowerCase(),
                );
                return (
                  <li key={suggestion}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => toggleSuggestedRule(suggestion)}
                      className="flex min-h-8 w-full items-center justify-between rounded-lg px-2 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>{suggestion}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {selected ? "Добавлено · убрать" : "Добавить"}
                      </span>
                    </button>
                  </li>
                );
              })}
              {matchingSuggestions.length === 0 && (
                <li className="px-2 py-1 text-[11px] text-muted-foreground">
                  Готовых совпадений нет. Введите свою фразу и нажмите «Своё».
                </li>
              )}
            </ul>
            {normalizedInput &&
              !suggestedRules.some(
                (suggestion) =>
                  suggestion.toLocaleLowerCase() === normalizedInput,
              ) && (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addRule()}
                  className="mt-1 w-full rounded-md border-t border-border px-2 py-1.5 text-left text-xs font-medium text-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Добавить свою фразу «{newRule.trim()}»
                </button>
              )}
          </div>
        )}
      </div>

    </section>
  );
}
