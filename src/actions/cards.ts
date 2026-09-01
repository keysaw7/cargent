"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, actionOk, postgresErrorMessage, type ActionResult } from "@/lib/action-result";
import { removeCardArtIfUnreferenced } from "@/lib/card-art";
import { getCurrentProfile, requireUserId } from "@/lib/queries/auth";
import { getOwnedCard, listCardSlugs } from "@/lib/queries/cards";
import { getOwnedCollection } from "@/lib/queries/collections";
import { slugify, uniqueSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import { cardDraftSchema, cardSchema } from "@/lib/validations/card";
import type { Database } from "@/types/database";

function parseCardForm(formData: FormData) {
  const abilities = JSON.parse(String(formData.get("abilities") ?? "[]")) as unknown;
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return cardSchema.safeParse({
    collectionId: formData.get("collectionId"),
    name: formData.get("name"),
    kind: formData.get("kind"),
    template: formData.get("template") || undefined,
    provider: formData.get("provider"),
    level: formData.get("level"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    tags,
    abilities,
    imagePath: formData.get("imagePath") || null,
    isPublished: formData.get("isPublished") === "true",
  });
}

async function revalidateCardPaths(username: string, collectionSlug: string, cardId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/explorer");
  revalidatePath(`/u/${username}`);
  revalidatePath(`/u/${username}/${collectionSlug}`);
  if (cardId) {
    revalidatePath(`/cards/${cardId}`);
  }
}

async function deleteOwnedCardDraft(
  supabase: SupabaseClient<Database>,
  userId: string,
  collectionId: string,
  cardId?: string | null,
) {
  let query = supabase.from("card_drafts").delete().eq("user_id", userId).eq("collection_id", collectionId);
  query = cardId ? query.eq("card_id", cardId) : query.is("card_id", null);
  await query;
}

async function replaceAbilities(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cardId: string,
  abilities: { name: string; description: string; power: number }[],
) {
  const { error: deleteError } = await supabase.from("card_abilities").delete().eq("card_id", cardId);
  if (deleteError) {
    throw deleteError;
  }

  if (abilities.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("card_abilities").insert(
    abilities.map((ability, position) => ({
      card_id: cardId,
      name: ability.name,
      description: ability.description,
      power: ability.power,
      position,
    })),
  );

  if (insertError) {
    throw insertError;
  }
}

export async function createCardAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const parsed = parseCardForm(formData);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Formulaire incomplet.");
  }

  const userId = await requireUserId();
  const collection = await getOwnedCollection(parsed.data.collectionId, userId);
  if (!collection) {
    return actionError("Collection introuvable.");
  }

  const slugs = await listCardSlugs(collection.id);
  const slug = uniqueSlug(slugify(parsed.data.name), slugs);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cards")
    .insert({
      collection_id: collection.id,
      name: parsed.data.name,
      slug,
      kind: parsed.data.kind,
      template: parsed.data.template,
      provider: parsed.data.provider || null,
      level: parsed.data.level,
      short_description: parsed.data.shortDescription,
      description: parsed.data.description ?? "",
      tags: parsed.data.tags,
      image_path: parsed.data.imagePath ?? null,
      is_published: parsed.data.isPublished,
    })
    .select("id")
    .single();

  if (error || !data) {
    await removeCardArtIfUnreferenced(supabase, parsed.data.imagePath);
    return actionError(postgresErrorMessage(error ?? { message: "Création impossible." }));
  }

  try {
    await replaceAbilities(supabase, data.id, parsed.data.abilities);
  } catch {
    await supabase.from("cards").delete().eq("id", data.id);
    await removeCardArtIfUnreferenced(supabase, parsed.data.imagePath);
    return actionError("Impossible d’enregistrer les capacités.");
  }

  await deleteOwnedCardDraft(supabase, userId, collection.id);

  const profile = await getCurrentProfile();
  if (profile) {
    await revalidateCardPaths(profile.username, collection.slug, data.id);
  }

  redirect(`/dashboard/collections/${collection.id}`);
}

export async function updateCardAction(cardId: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseCardForm(formData);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Formulaire incomplet.");
  }

  const userId = await requireUserId();
  const card = await getOwnedCard(cardId, userId);
  if (!card) {
    return actionError("Carte introuvable.");
  }

  const previousImage = card.image_path;
  const slugs = (await listCardSlugs(card.collection_id)).filter((slug) => slug !== card.slug);
  const slug = uniqueSlug(slugify(parsed.data.name), slugs);
  const supabase = await createClient();

  const { error } = await supabase
    .from("cards")
    .update({
      name: parsed.data.name,
      slug,
      kind: parsed.data.kind,
      template: parsed.data.template,
      provider: parsed.data.provider || null,
      level: parsed.data.level,
      short_description: parsed.data.shortDescription,
      description: parsed.data.description ?? "",
      tags: parsed.data.tags,
      image_path: parsed.data.imagePath ?? null,
      is_published: parsed.data.isPublished,
    })
    .eq("id", cardId);

  if (error) {
    if (parsed.data.imagePath && parsed.data.imagePath !== previousImage) {
      await removeCardArtIfUnreferenced(supabase, parsed.data.imagePath);
    }
    return actionError(postgresErrorMessage(error));
  }

  try {
    await replaceAbilities(supabase, cardId, parsed.data.abilities);
  } catch {
    return actionError("Impossible d’enregistrer les capacités.");
  }

  await deleteOwnedCardDraft(supabase, userId, card.collection_id, cardId);

  if (previousImage && previousImage !== parsed.data.imagePath) {
    await removeCardArtIfUnreferenced(supabase, previousImage);
  }

  const profile = await getCurrentProfile();
  if (profile) {
    await revalidateCardPaths(profile.username, card.collections.slug ?? "", cardId);
  }

  redirect(`/dashboard/collections/${card.collection_id}`);
}

export async function deleteCardAction(cardId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const card = await getOwnedCard(cardId, userId);
  if (!card) {
    return actionError("Carte introuvable.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) {
    return actionError("Impossible de supprimer la carte.");
  }

  await removeCardArtIfUnreferenced(supabase, card.image_path);

  const profile = await getCurrentProfile();
  if (profile) {
    await revalidateCardPaths(profile.username, card.collections.slug ?? "", cardId);
  }

  redirect(`/dashboard/collections/${card.collection_id}`);
}

export async function deleteCardForm(cardId: string): Promise<void> {
  await deleteCardAction(cardId);
}

export async function saveCardDraftAction(input: unknown): Promise<ActionResult> {
  const parsed = cardDraftSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Brouillon invalide.");
  }

  const userId = await requireUserId();
  const collection = await getOwnedCollection(parsed.data.collectionId, userId);
  if (!collection) {
    return actionError("Collection introuvable.");
  }

  if (parsed.data.cardId) {
    const card = await getOwnedCard(parsed.data.cardId, userId);
    if (!card || card.collection_id !== collection.id) {
      return actionError("Carte introuvable.");
    }
  }

  const supabase = await createClient();
  const payload = {
    user_id: userId,
    collection_id: collection.id,
    card_id: parsed.data.cardId ?? null,
    name: parsed.data.name,
    kind: parsed.data.kind,
    template: parsed.data.template,
    provider: parsed.data.provider,
    level: parsed.data.level,
    short_description: parsed.data.shortDescription,
    description: parsed.data.description,
    tags: parsed.data.tags,
    abilities: parsed.data.abilities,
    image_path: parsed.data.imagePath ?? null,
    generate_prompt: parsed.data.generatePrompt,
    is_published: parsed.data.isPublished,
  };

  let existingQuery = supabase
    .from("card_drafts")
    .select("id")
    .eq("user_id", userId)
    .eq("collection_id", collection.id);
  existingQuery = parsed.data.cardId
    ? existingQuery.eq("card_id", parsed.data.cardId)
    : existingQuery.is("card_id", null);

  const { data: existing } = await existingQuery.maybeSingle();
  const { error } = existing
    ? await supabase.from("card_drafts").update(payload).eq("id", existing.id)
    : await supabase.from("card_drafts").insert(payload);

  if (error) {
    return actionError(postgresErrorMessage(error));
  }

  return actionOk();
}

export async function deleteCardDraftAction(
  collectionId: string,
  cardId?: string | null,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const collection = await getOwnedCollection(collectionId, userId);
  if (!collection) {
    return actionError("Collection introuvable.");
  }

  const supabase = await createClient();
  await deleteOwnedCardDraft(supabase, userId, collection.id, cardId);
  return actionOk();
}
