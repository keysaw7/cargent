import type { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";

import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import {
  IMAGE_GENERATION_FORMAT,
  IMAGE_GENERATION_MODEL,
  IMAGE_GENERATION_QUALITY,
  IMAGE_GENERATION_SIZE,
} from "@/lib/constants";
import { getServerEnv, publicStorageUrl } from "@/lib/env";
import { quotaErrorMessage, openaiErrorMessage } from "@/lib/image-generation-errors";
import { CARD_BUCKET, generatedArtPath, validateGeneratedImageBytes } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type GeneratedCardImage = {
  id: string;
  imagePath: string;
  imageUrl: string;
  prompt: string;
};

export async function recordGeneratedImage(
  supabase: SupabaseClient<Database>,
  input: { userId: string; prompt: string; imagePath: string },
): Promise<ActionResult<{ id: string; imagePath: string; prompt: string }>> {
  const { data, error } = await supabase
    .from("image_generations")
    .insert({
      user_id: input.userId,
      prompt: input.prompt,
      image_path: input.imagePath,
    })
    .select("id")
    .single();

  if (error || !data) {
    await supabase.storage.from(CARD_BUCKET).remove([input.imagePath]);
    return actionError("Impossible d’enregistrer l’image générée.");
  }

  return actionOk({
    id: data.id,
    imagePath: input.imagePath,
    prompt: input.prompt,
  });
}

export async function consumeImageGenerationQuota(
  supabase: SupabaseClient<Database>,
): Promise<ActionResult<number>> {
  const { data, error } = await supabase.rpc("consume_image_generation_quota");
  if (error) {
    return actionError(quotaErrorMessage(error) ?? "Impossible de vérifier le quota de génération.");
  }

  return actionOk(data);
}

export async function generateCardArt(userId: string, prompt: string): Promise<ActionResult<GeneratedCardImage>> {
  const supabase = await createClient();
  const quota = await consumeImageGenerationQuota(supabase);
  if (!quota.ok) {
    return quota;
  }

  let openai: OpenAI;
  try {
    openai = new OpenAI({ apiKey: getServerEnv().openaiApiKey });
  } catch {
    return actionError("La génération d’image n’est pas configurée.");
  }

  let bytes: Buffer;
  try {
    const result = await openai.images.generate({
      model: IMAGE_GENERATION_MODEL,
      prompt,
      size: IMAGE_GENERATION_SIZE,
      quality: IMAGE_GENERATION_QUALITY,
      output_format: IMAGE_GENERATION_FORMAT,
    });
    const encoded = result.data?.[0]?.b64_json;
    if (!encoded) {
      return actionError("Le modèle n’a renvoyé aucune image.");
    }

    bytes = Buffer.from(encoded, "base64");
  } catch (error) {
    return actionError(openaiErrorMessage(error));
  }

  const validationError = validateGeneratedImageBytes(bytes, "image/webp");
  if (validationError) {
    return actionError(validationError);
  }

  const imagePath = generatedArtPath(userId, IMAGE_GENERATION_FORMAT);
  const { error } = await supabase.storage.from(CARD_BUCKET).upload(imagePath, bytes, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) {
    return actionError("Impossible d’enregistrer l’image générée.");
  }

  const recorded = await recordGeneratedImage(supabase, { userId, prompt, imagePath });
  if (!recorded.ok || !recorded.data) {
    return recorded.ok ? actionError("Impossible d’enregistrer l’image générée.") : recorded;
  }

  const imageUrl = publicStorageUrl(imagePath);
  if (!imageUrl) {
    await supabase.storage.from(CARD_BUCKET).remove([imagePath]);
    await supabase.from("image_generations").delete().eq("id", recorded.data.id);
    return actionError("Impossible d’enregistrer l’image générée.");
  }

  return actionOk({
    id: recorded.data.id,
    imagePath,
    imageUrl,
    prompt,
  });
}
