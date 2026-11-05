// Интерфейс настройки текстовых исключений автопечати.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestedRules = [
  "Прямой поток",
  "Расходники",
  "Возврат",
  "Продавцу",
  "Ozon Полка",
];

interface AutoPrintRulesProps {
  rules: string[];
  onRulesChange: (rules: string[]) => void;
}

export default function AutoPrintRules({
  rules,
  onRulesChange,
}: AutoPrintRulesProps) {
  const [newRule, setNewRule] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const normalizedInput = newRule.trim().toLocaleLowerCase();
  const matchingSuggestions = suggestedRules.filter((suggestion) =>
    suggestion.toLocaleLowerCase().includes(normalizedInput),
  );
  const allSuggestionsSelected = suggestedRules.every((suggestion) =>
    rules.some(
      (rule) => rule.toLocaleLowerCase() === suggestion.toLocaleLowerCase(),
    ),
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
            (rule) =>
              rule.toLocaleLowerCase() !== suggestion.toLocaleLowerCase(),
          )
        : [...rules, suggestion],
    );
  };

  return (
    <section
      aria-labelledby="auto-print-rules-title"
      className={`w-full rounded-lg border p-2 transition-colors ${
        rules.length
          ? "border-amber-500/30 bg-amber-500/[0.04] dark:bg-amber-500/[0.03]"
          : "border-border bg-card"
      }`}
    >
      {/* Шапка */}
      <div className="flex items-center justify-between gap-2 min-h-[18px]">
        <h2
          id="auto-print-rules-title"
          className="text-xs font-semibold leading-none text-foreground"
        >
          Исключения
        </h2>
        {rules.length > 0 && (
          <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800 dark:text-amber-300">
            Активны · {rules.length}
          </span>
        )}
      </div>

      {/* Список правил */}
      {rules.length > 0 ? (
        <>
          <p className="mt-0.5 text-[11px] leading-tight text-amber-900 dark:text-amber-200">
            Автопечать пропустит текст, содержащий:
          </p>
          <ul className="mt-1 flex flex-wrap gap-1 max-h-[84px] overflow-y-auto">
            {rules.map((rule, index) => (
              <li
                key={`${rule}-${index}`}
                className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-amber-500/20 bg-background py-0.5 pl-2 pr-0.5 text-[11px] font-medium leading-none"
              >
                <span className="break-all truncate max-w-[150px]">{rule}</span>
                <button
                  type="button"
                  aria-label={`Удалить исключение «${rule}»`}
                  onClick={() =>
                    onRulesChange(
                      rules.filter((_, ruleIndex) => ruleIndex !== index),
                    )
                  }
                  className="flex size-4 shrink-0 items-center justify-center rounded-full text-amber-800 transition-colors hover:bg-amber-500/20 focus-visible:outline-none dark:text-amber-200 text-xs"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
          Исключений нет — автопечать не будет пропускать текст по правилам.
        </p>
      )}

      {/* Форма ввода */}
      <div
        className="relative mt-1.5"
        onBlur={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setSuggestionsOpen(false);
          }
        }}
      >
        <form
          className="flex gap-1"
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
            className="h-8 select-text text-xs rounded-md px-2.5"
          />
          <Button
            type="submit"
            variant="outline"
            className="h-8 shrink-0 rounded-md text-[11px] px-2.5"
          >
            Добавить
          </Button>
        </form>

        {/* Выпадающий список подсказок */}
        {suggestionsOpen && (
          <div
            id="excluded-rule-suggestions"
            className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <div className="mb-0.5 flex items-center justify-between gap-2 px-1">
              <span className="text-[10px] font-semibold text-muted-foreground">
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
                className="rounded-sm text-[10px] font-medium text-primary hover:underline focus-visible:outline-none disabled:cursor-default disabled:text-muted-foreground disabled:no-underline"
              >
                Добавить все
              </button>
            </div>
            <ul className="max-h-28 overflow-y-auto">
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
                      className="flex min-h-6 w-full items-center justify-between rounded px-1.5 text-left text-[11px] transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
                    >
                      <span className="truncate">{suggestion}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {selected ? "Добавлено · убрать" : "Добавить"}
                      </span>
                    </button>
                  </li>
                );
              })}
              {matchingSuggestions.length === 0 && (
                <li className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  Готовых совпадений нет. Введите свою фразу и нажмите «Своё».
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
