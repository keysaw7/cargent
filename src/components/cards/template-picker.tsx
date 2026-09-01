"use client";

import { TradingCard } from "@/components/cards/trading-card";
import { CARD_TEMPLATE_STYLES, getCardTemplateStyle } from "@/lib/card-templates";
import { CARD_TEMPLATES, type CardKind, type CardTemplate } from "@/lib/constants";
import { SPECIMEN_CARD } from "@/lib/specimen";
import { cn } from "@/lib/utils";

type TemplatePickerProps = {
  value: CardTemplate;
  onChange: (template: CardTemplate) => void;
  kind: CardKind;
};

export function TemplatePicker({ value, onChange, kind }: TemplatePickerProps) {
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = CARD_TEMPLATES.indexOf(value);
    const columns = event.currentTarget.clientWidth >= 640 ? 3 : 2;
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % CARD_TEMPLATES.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + CARD_TEMPLATES.length) % CARD_TEMPLATES.length;
        break;
      case "ArrowDown":
        nextIndex = Math.min(CARD_TEMPLATES.length - 1, currentIndex + columns);
        break;
      case "ArrowUp":
        nextIndex = Math.max(0, currentIndex - columns);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = CARD_TEMPLATES.length - 1;
        break;
      default:
        return;
    }

    const nextTemplate = CARD_TEMPLATES[nextIndex];
    if (!nextTemplate) {
      return;
    }

    event.preventDefault();
    onChange(nextTemplate);
    const nextButton = event.currentTarget.querySelector<HTMLButtonElement>(
      `[data-template="${nextTemplate}"]`,
    );
    nextButton?.focus();
  }

  return (
    <fieldset className="space-y-3">
      <legend className="font-mono text-[11px] tracking-[0.24em] text-gold uppercase">Modèle de carte</legend>
      <div
        role="radiogroup"
        aria-label="Modèle de carte"
        onKeyDown={onKeyDown}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {CARD_TEMPLATES.map((template) => {
          const style = getCardTemplateStyle(template);
          const selected = template === value;

          return (
            <button
              key={template}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${style.label}. ${style.description}`}
              data-template={template}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(template)}
              className={cn(
                "rounded-lg border bg-obsidian/60 p-2 text-left transition-colors",
                selected ? "border-holo ring-1 ring-holo" : "border-gold/15 hover:border-gold/40",
              )}
            >
              <div className="pointer-events-none flex h-[148px] items-start justify-center overflow-hidden">
                <TradingCard
                  card={{
                    ...SPECIMEN_CARD,
                    kind,
                    template,
                    name: CARD_TEMPLATE_STYLES[template].label,
                  }}
                  size="sm"
                  interactive={false}
                  className="origin-top scale-[0.58]"
                />
              </div>
              <span className="mt-1 block font-mono text-[11px] tracking-[0.16em] text-ivory uppercase">
                {style.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
