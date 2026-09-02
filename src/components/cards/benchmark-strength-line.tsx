import {
  formatBenchmarkScore,
  getBenchmarkDefinition,
  type ModelCategory,
} from "@/lib/model-benchmarks";
import {
  selectBestBenchmark,
  strengthTierFromNormalized,
  STRENGTH_TIERS,
  type ScoredBenchmark,
} from "@/lib/benchmark-stats";
import { cn } from "@/lib/utils";

const TIER_STOPS: Record<(typeof STRENGTH_TIERS)[number], number> = {
  Low: 12.5,
  Medium: 37.5,
  High: 62.5,
  XHigh: 87.5,
};

type BenchmarkStrengthLineProps = {
  category: ModelCategory;
  scores: ScoredBenchmark[];
  className?: string;
};

export function BenchmarkStrengthLine({ category, scores, className }: BenchmarkStrengthLineProps) {
  const best = selectBestBenchmark(category, scores);
  if (!best) {
    return (
      <p className={cn("px-3 pb-3 font-mono text-[11px] tracking-[0.12em] text-ivory/55 uppercase", className)}>
        Benchmarks non renseignés
      </p>
    );
  }

  const definition = getBenchmarkDefinition(category, best.key);
  if (!definition) {
    return null;
  }

  const tier = strengthTierFromNormalized(best.normalized);
  const progress = Math.min(100, Math.max(0, best.normalized));

  return (
    <div
      className={cn("px-3 pb-3", className)}
      aria-label={`${definition.name} ${formatBenchmarkScore(definition, best.score)}, palier ${tier}`}
    >
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate font-mono text-[10px] tracking-[0.14em] text-ivory uppercase">
          {definition.shortLabel}
        </span>
        <span className="shrink-0 font-mono text-[10px] tracking-[0.16em] text-ivory/80 uppercase">{tier}</span>
      </div>
      <div className="relative h-2">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ivory/20" />
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2"
          style={{ width: `${progress}%`, background: definition.color }}
        />
        {STRENGTH_TIERS.map((label) => {
          const active =
            (label === "Low" && progress >= 0) ||
            (label === "Medium" && progress >= 25) ||
            (label === "High" && progress >= 50) ||
            (label === "XHigh" && progress >= 75);
          const isCurrent = label === tier;
          return (
            <span
              key={label}
              aria-hidden="true"
              className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                left: `${TIER_STOPS[label]}%`,
                background: isCurrent ? definition.color : active ? definition.color : "transparent",
                borderColor: definition.color,
                opacity: isCurrent || active ? 1 : 0.45,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
