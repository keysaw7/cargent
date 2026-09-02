import { StarRow } from "@/components/cards/star-row";
import { BenchmarkRadar } from "@/components/cards/benchmark-radar";
import { getCardTemplateStyle } from "@/lib/card-templates";
import { DEFAULT_CARD_TEMPLATE, cardKindLabel } from "@/lib/constants";
import {
  averageNormalizedScore,
  benchmarkCompleteness,
  selectBestBenchmark,
} from "@/lib/benchmark-stats";
import {
  formatBenchmarkScore,
  getBenchmarkDefinition,
  modelCategoryLabel,
} from "@/lib/model-benchmarks";
import { formatPricingCompact } from "@/lib/model-pricing";
import { cn } from "@/lib/utils";
import type { TradingCardView } from "@/components/cards/trading-card";

type ModelCardBackProps = {
  card: TradingCardView;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function ModelCardBack({ card, className, size = "sm" }: ModelCardBackProps) {
  const style = getCardTemplateStyle(card.template ?? DEFAULT_CARD_TEMPLATE);
  const category = card.modelCategory ?? null;
  const scores = (card.benchmarks ?? []).map((benchmark) => ({
    key: benchmark.key,
    score: benchmark.score,
  }));
  const best = category ? selectBestBenchmark(category, scores) : null;
  const average = category ? averageNormalizedScore(category, scores) : null;
  const completeness = category ? benchmarkCompleteness(category, scores) : { filled: 0, total: 6 };
  const bestDefinition =
    category && best ? getBenchmarkDefinition(category, best.key) : undefined;

  return (
    <article
      className={cn(
        "relative aspect-[59/86] w-full max-w-[320px]",
        size === "sm" && "max-w-[220px]",
        size === "lg" && "max-w-[380px]",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
          style.outerRadius,
          style.frameClass,
          style.framePadding,
        )}
      >
        <div className={cn("h-full", style.doubleRing && "bg-ivory/15 p-px", style.innerRadius)}>
          <div className={cn("relative flex h-full flex-col overflow-hidden", style.innerClass, style.innerRadius)}>
            <header className="relative z-10 flex items-start justify-between gap-3 px-3 pt-3">
              <div className="min-w-0">
                <p className={cn(style.kindClass, style.accentClass)}>{cardKindLabel(card.kind)}</p>
                <h3 className={cn("line-clamp-2", style.titleClass)}>{card.name}</h3>
              </div>
              <p className={cn("shrink-0", style.levelClass)}>NIV {card.level}</p>
            </header>
            <StarRow
              level={card.level}
              className="relative z-10 px-3 pt-2"
              filledClass={style.starFilledClass}
              emptyClass={style.starEmptyClass}
            />
            <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-2 pt-2">
              {category ? (
                <BenchmarkRadar
                  category={category}
                  scores={scores}
                  size={size === "lg" ? "md" : "sm"}
                  showLabels={size !== "sm"}
                />
              ) : (
                <p className="px-3 font-mono text-[11px] tracking-[0.12em] text-ivory/55 uppercase">
                  Catégorie non renseignée
                </p>
              )}
            </div>
            <dl className="relative z-10 mt-auto space-y-1 px-3 pb-3 font-mono text-[10px] tracking-[0.08em] text-ivory/85 uppercase">
              <div className="flex justify-between gap-2 border-t border-gold/20 pt-1.5">
                <dt>Meilleur</dt>
                <dd className="truncate text-right">
                  {best && bestDefinition
                    ? `${bestDefinition.shortLabel} ${formatBenchmarkScore(bestDefinition, best.score)}`
                    : "N/D"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Indice moyen</dt>
                <dd>{average === null ? "N/D" : Math.round(average)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Catégorie</dt>
                <dd>{category ? modelCategoryLabel(category) : "N/D"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Scores</dt>
                <dd>
                  {completeness.filled}/{completeness.total}
                </dd>
              </div>
              {card.pricing ? (
                <div className="flex justify-between gap-2">
                  <dt>Tarif</dt>
                  <dd className="truncate text-right normal-case tracking-normal">
                    {formatPricingCompact(card.pricing)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </div>
    </article>
  );
}
