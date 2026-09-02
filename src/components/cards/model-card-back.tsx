import { BenchmarkRadar } from "@/components/cards/benchmark-radar";
import { getCardTemplateStyle } from "@/lib/card-templates";
import { DEFAULT_CARD_TEMPLATE } from "@/lib/constants";
import { xhighScore } from "@/lib/benchmark-efforts";
import {
  CARD_BACK_BENCH_SHARE,
  CARD_BACK_RADAR_SHARE,
  cardFrameClass,
  radarSizeForBack,
  type CardSize,
} from "@/lib/card-layout";
import {
  formatBenchmarkScore,
  getBenchmarkDefinition,
  getBenchmarkPreset,
} from "@/lib/model-benchmarks";
import { formatPricingCompact, formatPricingCorner } from "@/lib/model-pricing";
import { cn } from "@/lib/utils";
import type { TradingCardView } from "@/components/cards/trading-card";

type ModelCardBackProps = {
  card: TradingCardView;
  className?: string;
  size?: CardSize;
};

export function ModelCardBack({ card, className, size = "sm" }: ModelCardBackProps) {
  const style = getCardTemplateStyle(card.template ?? DEFAULT_CARD_TEMPLATE);
  const category = card.modelCategory ?? null;
  const scores = (card.benchmarks ?? []).map((benchmark) => ({
    key: benchmark.key,
    efforts: benchmark.efforts,
  }));
  const byKey = new Map((card.benchmarks ?? []).map((benchmark) => [benchmark.key, benchmark]));

  return (
    <article aria-label={`Verso de ${card.name}`} className={cn("relative", cardFrameClass(size), className)}>
      <div
        className={cn(
          "absolute inset-0 shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
          style.outerRadius,
          style.frameClass,
          style.framePadding,
        )}
      >
        <div className={cn("h-full", style.doubleRing && "bg-ivory/15 p-px", style.innerRadius)}>
          <div
            className={cn("relative grid h-full overflow-hidden", style.innerClass, style.innerRadius)}
            style={{ gridTemplateRows: `${CARD_BACK_RADAR_SHARE} ${CARD_BACK_BENCH_SHARE}` }}
          >
            {card.pricing ? (
              <p className={cn("absolute top-2 right-3 z-20 font-mono text-[10px] leading-none tracking-[0.04em]", style.abilityPowerClass)}>
                <span className="sr-only">{formatPricingCompact(card.pricing)}</span>
                <span aria-hidden="true">{formatPricingCorner(card.pricing)}</span>
              </p>
            ) : null}
            <div className="relative z-10 min-h-0 px-1 pt-0">
              {category ? (
                <BenchmarkRadar
                  category={category}
                  scores={scores}
                  size={radarSizeForBack(size)}
                  showLabels={size !== "sm"}
                  className="h-full w-full"
                />
              ) : (
                <p className="px-3 font-mono text-[11px] tracking-[0.12em] text-ivory/55 uppercase">
                  Catégorie non renseignée
                </p>
              )}
            </div>
            {category ? (
              <ul className="relative z-10 grid min-h-0 grid-rows-6 px-3 pb-2 font-mono text-[10px] tracking-[0.08em] text-ivory/85 uppercase">
                {getBenchmarkPreset(category).map((definition) => {
                  const stored = byKey.get(definition.key);
                  const score = stored ? xhighScore(stored.efforts) : null;
                  const displayDefinition = stored
                    ? (getBenchmarkDefinition(category, stored.key) ?? definition)
                    : definition;
                  return (
                    <li key={definition.key} className="flex min-h-0 items-center justify-between gap-2 border-t border-gold/15">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ background: definition.color }}
                        />
                        <span className="truncate">{definition.shortLabel}</span>
                      </span>
                      <span className="shrink-0 normal-case tracking-normal" style={{ color: definition.color }}>
                        {score === null ? "N/D" : formatBenchmarkScore(displayDefinition, score)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
