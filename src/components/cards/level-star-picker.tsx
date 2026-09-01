"use client";

import { useState } from "react";

import { LevelStar } from "@/components/cards/star-row";
import { MAX_LEVEL, MIN_LEVEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LevelStarPickerProps = {
  id?: string;
  name: string;
  value: number;
  onChange: (level: number) => void;
};

function clampLevel(level: number): number {
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level));
}

export function LevelStarPicker({ id, name, value, onChange }: LevelStarPickerProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const selected = clampLevel(value);
  const displayLevel = hovered ?? selected;

  function select(level: number) {
    onChange(clampLevel(level));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let nextLevel = selected;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        nextLevel = Math.min(MAX_LEVEL, selected + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        nextLevel = Math.max(MIN_LEVEL, selected - 1);
        break;
      case "Home":
        nextLevel = MIN_LEVEL;
        break;
      case "End":
        nextLevel = MAX_LEVEL;
        break;
      default:
        return;
    }

    event.preventDefault();
    select(nextLevel);
    const nextButton = event.currentTarget.querySelector<HTMLButtonElement>(
      `[data-level="${nextLevel}"]`,
    );
    nextButton?.focus();
  }

  return (
    <div>
      <input type="hidden" id={id} name={name} value={selected} />
      <div
        role="radiogroup"
        aria-label="Niveau"
        onKeyDown={onKeyDown}
        onMouseLeave={() => setHovered(null)}
        className="flex flex-wrap items-center gap-1"
      >
        {Array.from({ length: MAX_LEVEL }, (_, index) => {
          const level = index + 1;
          const checked = selected === level;

          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={`Niveau ${level}`}
              data-level={level}
              tabIndex={checked ? 0 : -1}
              onClick={() => select(level)}
              onMouseEnter={() => setHovered(level)}
              className={cn(
                "rounded-sm p-0.5 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
              )}
            >
              <LevelStar
                filled={level <= displayLevel}
                filledClass="text-gold"
                emptyClass="text-gold/25"
                className="size-6"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
