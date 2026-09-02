"use client";

import { MODEL_CATEGORIES, modelCategoryLabel, type ModelCategory } from "@/lib/model-benchmarks";
import { cn } from "@/lib/utils";

type ModelCategoryPickerProps = {
  value: ModelCategory | null;
  onChange: (category: ModelCategory) => void;
};

export function ModelCategoryPicker({ value, onChange }: ModelCategoryPickerProps) {
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = value ? MODEL_CATEGORIES.indexOf(value) : -1;
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (Math.max(currentIndex, 0) + 1) % MODEL_CATEGORIES.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex =
          currentIndex < 0
            ? MODEL_CATEGORIES.length - 1
            : (currentIndex - 1 + MODEL_CATEGORIES.length) % MODEL_CATEGORIES.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = MODEL_CATEGORIES.length - 1;
        break;
      default:
        return;
    }

    const nextCategory = MODEL_CATEGORIES[nextIndex];
    if (!nextCategory) {
      return;
    }

    event.preventDefault();
    onChange(nextCategory);
    const nextButton = event.currentTarget.querySelector<HTMLButtonElement>(
      `[data-category="${nextCategory}"]`,
    );
    nextButton?.focus();
  }

  return (
    <fieldset className="space-y-3">
      <legend className="font-mono text-[11px] tracking-[0.24em] text-gold uppercase">
        Catégorie de modèle
      </legend>
      <div
        role="radiogroup"
        aria-label="Catégorie de modèle"
        onKeyDown={onKeyDown}
        className="grid grid-cols-3 gap-2"
      >
        {MODEL_CATEGORIES.map((category) => {
          const selected = category === value;
          return (
            <button
              key={category}
              type="button"
              role="radio"
              aria-checked={selected}
              data-category={category}
              tabIndex={selected || (!value && category === "code") ? 0 : -1}
              onClick={() => onChange(category)}
              className={cn(
                "h-11 rounded-lg border font-mono text-xs tracking-[0.16em] uppercase transition-colors",
                selected ? "border-holo bg-holo/10 text-holo" : "border-gold/15 text-ivory hover:border-gold/40",
              )}
            >
              {modelCategoryLabel(category)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
