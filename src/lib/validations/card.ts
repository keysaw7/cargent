import { z } from "zod";

import {
  CARD_TEMPLATES,
  DEFAULT_CARD_TEMPLATE,
  MAX_ABILITIES,
  MAX_ABILITY_DESCRIPTION,
  MAX_ABILITY_NAME,
  MAX_ABILITY_POWER,
  MAX_CARD_NAME,
  MAX_DESCRIPTION,
  MAX_IMAGE_PROMPT_LENGTH,
  MAX_LEVEL,
  MAX_PROVIDER,
  MAX_SHORT_DESCRIPTION,
  MAX_TAG_LENGTH,
  MAX_TAGS,
  MIN_ABILITY_NAME,
  MIN_ABILITY_POWER,
  MIN_CARD_NAME,
  MIN_LEVEL,
  MIN_SHORT_DESCRIPTION,
  MIN_TAG_LENGTH,
} from "@/lib/constants";
import {
  getBenchmarkDefinition,
  isBenchmarkKey,
  MAX_BENCHMARK_KEY,
  MAX_BENCHMARK_VERSION,
  MAX_PRICE_USD,
  MAX_SOURCE_URL,
  MIN_SOURCE_URL,
  MODEL_CATEGORIES,
  type ModelCategory,
} from "@/lib/model-benchmarks";

export const httpsUrlSchema = z
  .string()
  .trim()
  .min(MIN_SOURCE_URL, "Ajoute une URL https.")
  .max(MAX_SOURCE_URL, `L’URL est limitée à ${MAX_SOURCE_URL} caractères.`)
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Utilise une URL https valide.");

export const abilitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_ABILITY_NAME, "Nomme la capacité.")
    .max(MAX_ABILITY_NAME, `Le nom de la capacité est limité à ${MAX_ABILITY_NAME} caractères.`),
  description: z
    .string()
    .trim()
    .max(MAX_ABILITY_DESCRIPTION, `La capacité est limitée à ${MAX_ABILITY_DESCRIPTION} caractères.`),
  power: z.coerce.number().int().min(MIN_ABILITY_POWER).max(MAX_ABILITY_POWER),
});

const optionalPriceSchema = z
  .number()
  .finite("Le prix est invalide.")
  .min(0, "Le prix ne peut pas être négatif.")
  .max(MAX_PRICE_USD, `Le prix est limité à ${MAX_PRICE_USD} USD.`)
  .nullable()
  .optional();

const draftPriceSchema = z.union([z.number().finite(), z.string(), z.null()]).optional();

export const cardPricingSchema = z.object({
  inputUsdPerMillion: optionalPriceSchema,
  outputUsdPerMillion: optionalPriceSchema,
  imageUsd: optionalPriceSchema,
  videoSecondUsd: optionalPriceSchema,
});

export const draftPricingSchema = z.object({
  inputUsdPerMillion: draftPriceSchema,
  outputUsdPerMillion: draftPriceSchema,
  imageUsd: draftPriceSchema,
  videoSecondUsd: draftPriceSchema,
});

export const publishedBenchmarkSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "Clé de benchmark invalide.")
    .max(MAX_BENCHMARK_KEY, `La clé est limitée à ${MAX_BENCHMARK_KEY} caractères.`),
  score: z.number().finite("Le score est invalide."),
  version: z
    .string()
    .trim()
    .max(MAX_BENCHMARK_VERSION, `La version est limitée à ${MAX_BENCHMARK_VERSION} caractères.`)
    .optional()
    .or(z.literal("")),
  sourceUrl: z
    .string()
    .trim()
    .max(MAX_SOURCE_URL, `L’URL est limitée à ${MAX_SOURCE_URL} caractères.`)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || httpsUrlSchema.safeParse(value).success, "Utilise une URL https valide."),
  measuredAt: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Indique une date de mesure valide."),
});

export const cardSchema = z
  .object({
    collectionId: z.uuid("Collection introuvable."),
    name: z
      .string()
      .trim()
      .min(MIN_CARD_NAME, `Le nom de la carte doit faire au moins ${MIN_CARD_NAME} caractères.`)
      .max(MAX_CARD_NAME, `Le nom de la carte est limité à ${MAX_CARD_NAME} caractères.`),
    kind: z.enum(["agent", "model"]),
    template: z.enum(CARD_TEMPLATES).default(DEFAULT_CARD_TEMPLATE),
    provider: z
      .string()
      .trim()
      .max(MAX_PROVIDER, `Le fournisseur est limité à ${MAX_PROVIDER} caractères.`)
      .optional()
      .or(z.literal("")),
    level: z.coerce.number().int().min(MIN_LEVEL).max(MAX_LEVEL),
    shortDescription: z
      .string()
      .trim()
      .min(MIN_SHORT_DESCRIPTION, `Ajoute un résumé d’au moins ${MIN_SHORT_DESCRIPTION} caractères.`)
      .max(MAX_SHORT_DESCRIPTION, `Le résumé est limité à ${MAX_SHORT_DESCRIPTION} caractères.`),
    description: z
      .string()
      .trim()
      .max(MAX_DESCRIPTION, `La description est limitée à ${MAX_DESCRIPTION} caractères.`)
      .optional()
      .or(z.literal("")),
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(MIN_TAG_LENGTH, `Chaque tag doit faire au moins ${MIN_TAG_LENGTH} caractères.`)
          .max(MAX_TAG_LENGTH, `Chaque tag est limité à ${MAX_TAG_LENGTH} caractères.`),
      )
      .max(MAX_TAGS, `Tu peux ajouter au plus ${MAX_TAGS} tags.`),
    abilities: z.array(abilitySchema).max(MAX_ABILITIES, `Tu peux ajouter au plus ${MAX_ABILITIES} capacités.`),
    modelCategory: z.enum(MODEL_CATEGORIES).nullable().optional(),
    benchmarks: z.array(publishedBenchmarkSchema).max(6).default([]),
    pricing: cardPricingSchema.nullable().optional(),
    imagePath: z.string().trim().max(240, "Chemin d’image invalide.").nullable().optional(),
    isPublished: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "agent") {
      if (data.modelCategory) {
        ctx.addIssue({
          code: "custom",
          message: "Une carte agent n’a pas de catégorie de modèle.",
          path: ["modelCategory"],
        });
      }
      if (data.benchmarks.length > 0) {
        ctx.addIssue({
          code: "custom",
          message: "Une carte agent n’enregistre pas de benchmarks.",
          path: ["benchmarks"],
        });
      }
      return;
    }

    if (!data.modelCategory) {
      ctx.addIssue({
        code: "custom",
        message: "Choisis une catégorie de modèle.",
        path: ["modelCategory"],
      });
      return;
    }

    const category = data.modelCategory;
    const seen = new Set<string>();
    for (const [index, benchmark] of data.benchmarks.entries()) {
      if (!isBenchmarkKey(category, benchmark.key)) {
        ctx.addIssue({
          code: "custom",
          message: "Ce benchmark n’appartient pas à la catégorie choisie.",
          path: ["benchmarks", index, "key"],
        });
        continue;
      }
      if (seen.has(benchmark.key)) {
        ctx.addIssue({
          code: "custom",
          message: "Chaque benchmark ne peut être saisi qu’une fois.",
          path: ["benchmarks", index, "key"],
        });
      }
      seen.add(benchmark.key);
      const definition = getBenchmarkDefinition(category, benchmark.key);
      if (
        definition &&
        (benchmark.score < definition.domain.min || benchmark.score > definition.domain.max)
      ) {
        ctx.addIssue({
          code: "custom",
          message: `Le score doit être entre ${definition.domain.min} et ${definition.domain.max}.`,
          path: ["benchmarks", index, "score"],
        });
      }
    }

    refinePricing(category, data.pricing, ctx);
  });

export type CardInput = z.infer<typeof cardSchema>;

export const draftAbilitySchema = z.object({
  name: z
    .string()
    .trim()
    .max(MAX_ABILITY_NAME, `Le nom de la capacité est limité à ${MAX_ABILITY_NAME} caractères.`),
  description: z
    .string()
    .trim()
    .max(MAX_ABILITY_DESCRIPTION, `La capacité est limitée à ${MAX_ABILITY_DESCRIPTION} caractères.`),
  power: z.coerce.number().int().min(MIN_ABILITY_POWER).max(MAX_ABILITY_POWER),
});

export const draftBenchmarkSchema = z.object({
  key: z.string().trim().max(MAX_BENCHMARK_KEY),
  score: z.union([z.number().finite(), z.string(), z.null()]).optional(),
  version: z
    .string()
    .trim()
    .max(MAX_BENCHMARK_VERSION, `La version est limitée à ${MAX_BENCHMARK_VERSION} caractères.`)
    .optional()
    .or(z.literal("")),
  sourceUrl: z
    .string()
    .trim()
    .max(MAX_SOURCE_URL, `L’URL est limitée à ${MAX_SOURCE_URL} caractères.`)
    .optional()
    .or(z.literal("")),
  measuredAt: z.string().trim().max(10).optional().or(z.literal("")),
});

export const cardDraftSchema = z.object({
  collectionId: z.uuid("Collection introuvable."),
  cardId: z.uuid("Carte introuvable.").nullable().optional(),
  name: z.string().trim().max(MAX_CARD_NAME, `Le nom de la carte est limité à ${MAX_CARD_NAME} caractères.`),
  kind: z.enum(["agent", "model"]),
  template: z.enum(CARD_TEMPLATES).default(DEFAULT_CARD_TEMPLATE),
  provider: z.string().trim().max(MAX_PROVIDER, `Le fournisseur est limité à ${MAX_PROVIDER} caractères.`),
  level: z.coerce.number().int().min(MIN_LEVEL).max(MAX_LEVEL),
  shortDescription: z
    .string()
    .trim()
    .max(MAX_SHORT_DESCRIPTION, `Le résumé est limité à ${MAX_SHORT_DESCRIPTION} caractères.`),
  description: z
    .string()
    .trim()
    .max(MAX_DESCRIPTION, `La description est limitée à ${MAX_DESCRIPTION} caractères.`),
  tags: z
    .array(z.string().trim().max(MAX_TAG_LENGTH, `Chaque tag est limité à ${MAX_TAG_LENGTH} caractères.`))
    .max(MAX_TAGS, `Tu peux ajouter au plus ${MAX_TAGS} tags.`),
  abilities: z.array(draftAbilitySchema).max(MAX_ABILITIES, `Tu peux ajouter au plus ${MAX_ABILITIES} capacités.`),
  modelCategory: z.enum(MODEL_CATEGORIES).nullable().optional(),
  benchmarks: z.array(draftBenchmarkSchema).max(6).default([]),
  pricing: draftPricingSchema.optional(),
  imagePath: z.string().trim().max(240, "Chemin d’image invalide.").nullable().optional(),
  generatePrompt: z
    .string()
    .trim()
    .max(MAX_IMAGE_PROMPT_LENGTH, `Le prompt est limité à ${MAX_IMAGE_PROMPT_LENGTH} caractères.`),
  isPublished: z.boolean(),
});

export type CardDraftInput = z.infer<typeof cardDraftSchema>;

function pricingHasValue(
  pricing: z.infer<typeof cardPricingSchema> | null | undefined,
  category: ModelCategory,
): boolean {
  if (!pricing) {
    return false;
  }
  switch (category) {
    case "code":
      return pricing.inputUsdPerMillion != null || pricing.outputUsdPerMillion != null;
    case "image":
      return pricing.imageUsd != null;
    case "video":
      return pricing.videoSecondUsd != null;
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
}

function refinePricing(
  category: ModelCategory,
  pricing: z.infer<typeof cardPricingSchema> | null | undefined,
  ctx: z.RefinementCtx,
) {
  if (!pricingHasValue(pricing, category)) {
    return;
  }
  if (!pricing) {
    return;
  }

  switch (category) {
    case "code":
      if (pricing.inputUsdPerMillion == null || pricing.outputUsdPerMillion == null) {
        ctx.addIssue({
          code: "custom",
          message: "Renseigne les prix input et output.",
          path: ["pricing", "inputUsdPerMillion"],
        });
      }
      break;
    case "image":
      if (pricing.imageUsd == null) {
        ctx.addIssue({
          code: "custom",
          message: "Renseigne le prix par image.",
          path: ["pricing", "imageUsd"],
        });
      }
      break;
    case "video":
      if (pricing.videoSecondUsd == null) {
        ctx.addIssue({
          code: "custom",
          message: "Renseigne le prix par seconde.",
          path: ["pricing", "videoSecondUsd"],
        });
      }
      break;
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
}
