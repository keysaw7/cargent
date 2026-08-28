import { z } from "zod";

import { USERNAME_PATTERN } from "@/lib/constants";

export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_PATTERN, "3 à 24 caractères : lettres minuscules, chiffres ou _."),
  email: z.email("Indique une adresse e-mail valide."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
});

export const signInSchema = z.object({
  email: z.email("Indique une adresse e-mail valide."),
  password: z.string().min(1, "Indique ton mot de passe."),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Indique une adresse e-mail valide."),
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
    confirmPassword: z.string().min(8, "Confirme le mot de passe."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Le nom affiché doit faire au moins 2 caractères.").max(40),
  bio: z.string().trim().max(280, "La bio est limitée à 280 caractères.").optional().or(z.literal("")),
});
