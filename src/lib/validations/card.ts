import { z } from "zod";

import {
  CARD_TEMPLATES,
  DEFAULT_CARD_TEMPLATE,
  MAX_ABILITIES,
  MAX_ABILITY_POWER,
  MAX_LEVEL,
  MAX_TAGS,
  MIN_ABILITY_POWER,
  MIN_LEVEL,
} from "@/lib/constants";

export const abilitySchema = z.object({
  name: z.string().trim().min(2, "Nomme la capacité.").max(40),
  description: z.string().trim().max(180, "La capacité est limitée à 180 caractères."),
  power: z.coerce.number().int().min(MIN_ABILITY_POWER).max(MAX_ABILITY_POWER),
});

export const cardSchema = z.object({
  collectionId: z.uuid("Collection introuvable."),
  name: z.string().trim().min(2, "Le nom de la carte doit faire au moins 2 caractères.").max(48),
  kind: z.enum(["agent", "model"]),
  template: z.enum(CARD_TEMPLATES).default(DEFAULT_CARD_TEMPLATE),
  provider: z.string().trim().max(40).optional().or(z.literal("")),
  level: z.coerce.number().int().min(MIN_LEVEL).max(MAX_LEVEL),
  shortDescription: z
    .string()
    .trim()
    .min(8, "Ajoute un résumé d’au moins 8 caractères.")
    .max(140, "Le résumé est limité à 140 caractères."),
  description: z
    .string()
    .trim()
    .max(2000, "La description est limitée à 2000 caractères.")
    .optional()
    .or(z.literal("")),
  tags: z.array(z.string().trim().min(2).max(24)).max(MAX_TAGS),
  abilities: z.array(abilitySchema).max(MAX_ABILITIES),
  imagePath: z.string().trim().max(240).nullable().optional(),
  isPublished: z.boolean(),
});

export type CardInput = z.infer<typeof cardSchema>;
