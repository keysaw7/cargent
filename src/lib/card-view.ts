import { publicStorageUrl } from "@/lib/env";
import { getBenchmarkPreset, isModelCategory, type ModelCategory } from "@/lib/model-benchmarks";
import { asPricingRow, rowToPricingView } from "@/lib/model-pricing";
import type { TradingCardView } from "@/components/cards/trading-card";
import type { CardBenchmark } from "@/types/database";
import type { CardWithAbilities, PublicCard } from "@/types/models";

function sortBenchmarks(category: ModelCategory | null, benchmarks: CardBenchmark[]) {
  if (!category) {
    return [...benchmarks];
  }
  const order = new Map(getBenchmarkPreset(category).map((definition, index) => [definition.key, index]));
  return [...benchmarks].sort((left, right) => {
    const leftIndex = order.get(left.benchmark_key) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = order.get(right.benchmark_key) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
}

export function cardToView(card: CardWithAbilities | PublicCard): TradingCardView {
  const modelCategory = isModelCategory(card.model_category) ? card.model_category : null;
  const pricingRow = asPricingRow(card.card_model_pricing);

  return {
    name: card.name,
    kind: card.kind,
    template: card.template,
    level: card.level,
    shortDescription: card.short_description,
    provider: card.provider,
    imageUrl: publicStorageUrl(card.image_path),
    abilities: [...(card.card_abilities ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((ability) => ({ name: ability.name, power: ability.power })),
    modelCategory,
    benchmarks: sortBenchmarks(modelCategory, card.card_benchmarks ?? []).map((benchmark) => ({
      key: benchmark.benchmark_key,
      efforts: {
        low: benchmark.low_score == null ? null : Number(benchmark.low_score),
        medium: benchmark.medium_score == null ? null : Number(benchmark.medium_score),
        high: benchmark.high_score == null ? null : Number(benchmark.high_score),
        xhigh: benchmark.xhigh_score == null ? null : Number(benchmark.xhigh_score),
      },
      version: benchmark.benchmark_version || undefined,
      sourceUrl: benchmark.source_url || undefined,
      measuredAt: benchmark.measured_at || undefined,
    })),
    pricing: modelCategory ? rowToPricingView(modelCategory, pricingRow) : null,
  };
}
