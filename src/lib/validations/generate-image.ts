import { z } from "zod";

import { MAX_IMAGE_PROMPT_LENGTH } from "@/lib/constants";

export const generateImageSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(8, "Décris l’image en au moins 8 caractères.")
    .max(MAX_IMAGE_PROMPT_LENGTH, `Le prompt est limité à ${MAX_IMAGE_PROMPT_LENGTH} caractères.`),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;
