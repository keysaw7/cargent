"use client";

import { cn } from "@/lib/utils";
import type { ImageGenerationPreview } from "@/types/models";

export function GeneratedImageHistory({
  generations,
  selectedPath,
  disabled,
  onSelect,
}: {
  generations: ImageGenerationPreview[];
  selectedPath: string | null;
  disabled?: boolean;
  onSelect: (generation: ImageGenerationPreview) => void;
}) {
  if (generations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5 sm:col-span-2">
      <p className="text-sm font-medium">Générations récentes</p>
      <div className="flex flex-wrap gap-2">
        {generations.map((generation) => {
          const selected = generation.imagePath === selectedPath;
          return (
            <button
              key={generation.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(generation)}
              aria-pressed={selected}
              title={generation.prompt}
              className={cn(
                "h-14 w-14 min-h-14 min-w-14 max-h-14 max-w-14 shrink-0 overflow-hidden rounded-md border bg-obsidian p-0",
                selected ? "border-gold" : "border-gold/20",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generation.imageUrl}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 max-h-14 max-w-14 object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}