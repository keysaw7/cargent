import {
  effectiveEffort,
  hasAnyEffort,
  type BenchmarkEffortScores,
} from "@/lib/benchmark-efforts";
import {
  getBenchmarkDefinition,
  getBenchmarkPreset,
  MAX_BENCHMARKS_PER_PRESET,
  normalizeBenchmarkScore,
  type ModelCategory,
} from "@/lib/model-benchmarks";

export type ScoredBenchmark = {
  key: string;
  efforts: BenchmarkEffortScores;
};

export function normalizePresentScore(
  category: ModelCategory,
  key: string,
  score: number,
): number | null {
  const definition = getBenchmarkDefinition(category, key);
  if (!definition || !Number.isFinite(score)) {
    return null;
  }
  return normalizeBenchmarkScore(definition, score);
}

export function selectBestBenchmark(
  category: ModelCategory,
  scores: ScoredBenchmark[],
): (ScoredBenchmark & { score: number; normalized: number }) | null {
  const preset = getBenchmarkPreset(category);
  let best: (ScoredBenchmark & { score: number; normalized: number }) | null = null;
  let bestIndex = Number.POSITIVE_INFINITY;

  for (const entry of scores) {
    const effective = effectiveEffort(entry.efforts);
    if (!effective) {
      continue;
    }
    const normalized = normalizePresentScore(category, entry.key, effective.score);
    if (normalized === null) {
      continue;
    }
    const presetIndex = preset.findIndex((definition) => definition.key === entry.key);
    if (presetIndex < 0) {
      continue;
    }
    if (
      !best ||
      normalized > best.normalized ||
      (normalized === best.normalized && presetIndex < bestIndex)
    ) {
      best = { ...entry, score: effective.score, normalized };
      bestIndex = presetIndex;
    }
  }

  return best;
}

export function averageNormalizedScore(
  category: ModelCategory,
  scores: ScoredBenchmark[],
): number | null {
  const values = scores.flatMap((entry) => {
    const effective = effectiveEffort(entry.efforts);
    if (!effective) {
      return [];
    }
    const normalized = normalizePresentScore(category, entry.key, effective.score);
    return normalized === null ? [] : [normalized];
  });

  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function benchmarkCompleteness(
  category: ModelCategory,
  scores: ScoredBenchmark[],
): { filled: number; total: number } {
  const presetKeys = new Set(getBenchmarkPreset(category).map((definition) => definition.key));
  const filled = new Set(
    scores.filter((entry) => hasAnyEffort(entry.efforts) && presetKeys.has(entry.key)).map((entry) => entry.key),
  ).size;

  return { filled, total: MAX_BENCHMARKS_PER_PRESET };
}
