import { hasAnyEffort, type BenchmarkEffortScores } from "@/lib/benchmark-efforts";
import { resolveCardTemplate } from "@/lib/card-templates";
import { DEFAULT_CARD_TEMPLATE, type CardKind, type CardTemplate } from "@/lib/constants";
import {
  getBenchmarkPreset,
  isModelCategory,
  type ModelCategory,
} from "@/lib/model-benchmarks";
import {
  asPricingRow,
  emptyCardFormPricing,
  rowToFormPricing,
  type CardFormPricing,
} from "@/lib/model-pricing";
import { draftAbilitySchema, draftBenchmarkSchema } from "@/lib/validations/card";
import type { CardDraft, Json } from "@/types/database";
import type { CardWithAbilities } from "@/types/models";

export type CardFormAbility = {
  name: string;
  description: string;
  power: number;
};

export type CardFormBenchmark = {
  key: string;
  low: string;
  medium: string;
  high: string;
  xhigh: string;
  version: string;
  sourceUrl: string;
  measuredAt: string;
};

export type CardFormValues = {
  name: string;
  kind: CardKind;
  template: CardTemplate;
  provider: string;
  level: number;
  shortDescription: string;
  description: string;
  tags: string;
  abilities: CardFormAbility[];
  modelCategory: ModelCategory | null;
  benchmarks: CardFormBenchmark[];
  pricing: CardFormPricing;
  imagePath: string | null;
  generatePrompt: string;
  isPublished: boolean;
};

const emptyAbility: CardFormAbility = { name: "", description: "", power: 50 };

export function emptyBenchmarkRow(key = ""): CardFormBenchmark {
  return { key, low: "", medium: "", high: "", xhigh: "", version: "", sourceUrl: "", measuredAt: "" };
}

export function emptyBenchmarksFor(category: ModelCategory): CardFormBenchmark[] {
  return getBenchmarkPreset(category).map((definition) => emptyBenchmarkRow(definition.key));
}

export function emptyCardFormValues(): CardFormValues {
  return {
    name: "",
    kind: "agent",
    template: DEFAULT_CARD_TEMPLATE,
    provider: "",
    level: 4,
    shortDescription: "",
    description: "",
    tags: "",
    abilities: [{ ...emptyAbility }],
    modelCategory: null,
    benchmarks: [],
    pricing: emptyCardFormPricing(),
    imagePath: null,
    generatePrompt: "",
    isPublished: true,
  };
}

export function parseDraftAbilities(value: Json): CardFormAbility[] {
  if (!Array.isArray(value)) {
    return [{ ...emptyAbility }];
  }

  const abilities = value.flatMap((item) => {
    const parsed = draftAbilitySchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });

  return abilities.length > 0 ? abilities : [{ ...emptyAbility }];
}

function scoreToString(value: unknown): string {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
}

function parseOptionalScore(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function formBenchmarkEfforts(benchmark: CardFormBenchmark): BenchmarkEffortScores {
  return {
    low: parseOptionalScore(benchmark.low),
    medium: parseOptionalScore(benchmark.medium),
    high: parseOptionalScore(benchmark.high),
    xhigh: parseOptionalScore(benchmark.xhigh),
  };
}

export function parseDraftBenchmarks(value: Json, category: ModelCategory | null): CardFormBenchmark[] {
  const fallback = category ? emptyBenchmarksFor(category) : [];
  if (!Array.isArray(value)) {
    return fallback;
  }

  const parsed = value.flatMap((item) => {
    const result = draftBenchmarkSchema.safeParse(item);
    if (!result.success || !result.data.key) {
      return [];
    }
    const xhigh = scoreToString(result.data.xhigh);
    const legacy = scoreToString(result.data.score);
    return [
      {
        key: result.data.key,
        low: scoreToString(result.data.low),
        medium: scoreToString(result.data.medium),
        high: scoreToString(result.data.high),
        xhigh: xhigh || legacy,
        version: result.data.version ?? "",
        sourceUrl: result.data.sourceUrl ?? "",
        measuredAt: result.data.measuredAt ?? "",
      },
    ];
  });

  if (!category) {
    return parsed;
  }

  const byKey = new Map(parsed.map((benchmark) => [benchmark.key, benchmark]));
  return emptyBenchmarksFor(category).map((row) => byKey.get(row.key) ?? row);
}

export function parseDraftPricing(value: Json): CardFormPricing {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyCardFormPricing();
  }
  const record = value as Record<string, unknown>;
  return {
    inputUsdPerMillion: scoreToString(record.inputUsdPerMillion ?? record.input_usd_per_million_tokens),
    outputUsdPerMillion: scoreToString(
      record.outputUsdPerMillion ?? record.output_usd_per_million_tokens,
    ),
    imageUsd: scoreToString(record.imageUsd ?? record.image_usd),
    videoSecondUsd: scoreToString(record.videoSecondUsd ?? record.video_second_usd),
  };
}

export function cardToFormValues(card: CardWithAbilities): CardFormValues {
  const modelCategory = isModelCategory(card.model_category) ? card.model_category : null;
  const stored = new Map(
    (card.card_benchmarks ?? []).map((benchmark) => [
      benchmark.benchmark_key,
      {
        key: benchmark.benchmark_key,
        low: scoreToString(benchmark.low_score),
        medium: scoreToString(benchmark.medium_score),
        high: scoreToString(benchmark.high_score),
        xhigh: scoreToString(benchmark.xhigh_score),
        version: benchmark.benchmark_version ?? "",
        sourceUrl: benchmark.source_url ?? "",
        measuredAt: benchmark.measured_at ?? "",
      } satisfies CardFormBenchmark,
    ]),
  );

  return {
    name: card.name,
    kind: card.kind,
    template: resolveCardTemplate(card.template),
    provider: card.provider ?? "",
    level: card.level,
    shortDescription: card.short_description,
    description: card.description,
    tags: card.tags.join(", "),
    abilities: card.card_abilities.length
      ? [...card.card_abilities]
          .sort((abilityA, abilityB) => abilityA.position - abilityB.position)
          .map((ability) => ({
            name: ability.name,
            description: ability.description,
            power: ability.power,
          }))
      : [{ ...emptyAbility }],
    modelCategory,
    benchmarks: modelCategory
      ? emptyBenchmarksFor(modelCategory).map((row) => stored.get(row.key) ?? row)
      : [],
    pricing: rowToFormPricing(asPricingRow(card.card_model_pricing)),
    imagePath: card.image_path,
    generatePrompt: "",
    isPublished: card.is_published,
  };
}

export function cardDraftToFormValues(draft: CardDraft): CardFormValues {
  const modelCategory = isModelCategory(draft.model_category) ? draft.model_category : null;
  return {
    name: draft.name,
    kind: draft.kind,
    template: resolveCardTemplate(draft.template),
    provider: draft.provider,
    level: draft.level,
    shortDescription: draft.short_description,
    description: draft.description,
    tags: draft.tags.join(", "),
    abilities: parseDraftAbilities(draft.abilities),
    modelCategory,
    benchmarks: parseDraftBenchmarks(draft.benchmarks, modelCategory),
    pricing: parseDraftPricing(draft.pricing),
    imagePath: draft.image_path,
    generatePrompt: draft.generate_prompt,
    isPublished: draft.is_published,
  };
}

export function getCardFormValues(card?: CardWithAbilities, draft?: CardDraft | null): CardFormValues {
  if (draft) {
    return cardDraftToFormValues(draft);
  }

  if (card) {
    return cardToFormValues(card);
  }

  return emptyCardFormValues();
}

export function formBenchmarkHasScore(benchmark: CardFormBenchmark): boolean {
  return hasAnyEffort({
    low: parseOptionalScore(benchmark.low),
    medium: parseOptionalScore(benchmark.medium),
    high: parseOptionalScore(benchmark.high),
    xhigh: parseOptionalScore(benchmark.xhigh),
  });
}
