import { z } from "zod";

export const collectionSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit faire au moins 2 caractères.").max(60),
  description: z
    .string()
    .trim()
    .max(400, "La description est limitée à 400 caractères.")
    .optional()
    .or(z.literal("")),
  isPublic: z.boolean(),
});
