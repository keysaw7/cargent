import OpenAI from "openai";

import { IMAGE_GENERATION_DAILY_LIMIT } from "@/lib/constants";

export function quotaErrorMessage(error: { code?: string; message?: string }) {
  const message = error.message ?? "";
  if (message.includes("quota_exceeded")) {
    return `Tu as atteint la limite de ${IMAGE_GENERATION_DAILY_LIMIT} images générées aujourd’hui.`;
  }

  if (message.includes("not_authenticated") || error.code === "28000") {
    return "Connexion requise pour générer une image.";
  }

  return null;
}

export function openaiErrorMessage(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    switch (error.status) {
      case 400:
        return "Ce prompt a été refusé. Reformule la description.";
      case 401:
        return "La clé OpenAI est invalide.";
      case 429:
        return "Le service de génération est saturé. Réessaie dans un instant.";
      default:
        return "Impossible de générer l’image.";
    }
  }

  return "Impossible de générer l’image.";
}

export function generationFailureStatus(error: string) {
  if (error.includes("limite")) {
    return 429;
  }

  if (error.includes("Connexion")) {
    return 401;
  }

  if (error.includes("n’est pas configurée") || error.includes("invalide")) {
    return 503;
  }

  return 502;
}
