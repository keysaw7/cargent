import { BenchmarkEffortLine } from "@/components/cards/benchmark-effort-line";
import type { TradingCardBenchmark } from "@/components/cards/trading-card";
import { EFFORT_LABELS, EFFORT_LEVELS } from "@/lib/benchmark-efforts";
import {
  formatBenchmarkScore,
  getBenchmarkDefinition,
  getBenchmarkPreset,
  type ModelCategory,
} from "@/lib/model-benchmarks";

function formatDate(value: string | undefined) {
  if (!value) {
    return null;
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export function BenchmarkDetailList({
  category,
  benchmarks,
}: {
  category: ModelCategory;
  benchmarks: TradingCardBenchmark[];
}) {
  const byKey = new Map(benchmarks.map((benchmark) => [benchmark.key, benchmark]));

  return (
    <ul className="space-y-3">
      {getBenchmarkPreset(category).map((definition) => {
        const stored = byKey.get(definition.key);
        const displayDefinition = stored
          ? (getBenchmarkDefinition(category, stored.key) ?? definition)
          : definition;
        return (
          <li key={definition.key} className="rounded-lg border border-gold/20 bg-card px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: definition.color }} />
                {definition.name}
              </h2>
            </div>
            {stored ? (
              <>
                <BenchmarkEffortLine
                  definition={displayDefinition}
                  efforts={stored.efforts}
                  density="detailed"
                  className="mt-3 max-w-[280px]"
                />
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs text-ivory/80 sm:grid-cols-4">
                  {EFFORT_LEVELS.map((level) => {
                    const score = stored.efforts[level];
                    return (
                      <div key={level} className="flex justify-between gap-2 sm:flex-col sm:justify-start">
                        <dt className="uppercase tracking-[0.12em] text-muted-foreground">{EFFORT_LABELS[level]}</dt>
                        <dd style={{ color: definition.color }}>
                          {score == null ? "N/D" : formatBenchmarkScore(displayDefinition, score)}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                {stored.version || stored.measuredAt || stored.sourceUrl ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {stored.version ? `Version ${stored.version}` : null}
                    {stored.measuredAt ? ` · ${formatDate(stored.measuredAt)}` : null}
                    {stored.sourceUrl ? (
                      <>
                        {" · "}
                        <a className="text-gold" href={stored.sourceUrl} rel="noreferrer" target="_blank">
                          Source
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Score non renseigné.</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
