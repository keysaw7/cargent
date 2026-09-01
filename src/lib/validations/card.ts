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

export const cardSchema = z.object({
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
  imagePath: z.string().trim().max(240, "Chemin d’image invalide.").nullable().optional(),
  isPublished: z.boolean(),
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
  imagePath: z.string().trim().max(240, "Chemin d’image invalide.").nullable().optional(),
  generatePrompt: z
    .string()
    .trim()
    .max(MAX_IMAGE_PROMPT_LENGTH, `Le prompt est limité à ${MAX_IMAGE_PROMPT_LENGTH} caractères.`),
  isPublished: z.boolean(),
});

export type CardDraftInput = z.infer<typeof cardDraftSchema>;
