"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, postgresErrorMessage, type ActionResult } from "@/lib/action-result";
import { getCurrentProfile, requireUserId } from "@/lib/queries/auth";
import { getOwnedCard, listCardSlugs } from "@/lib/queries/cards";
import { getOwnedCollection } from "@/lib/queries/collections";
import { slugify, uniqueSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import { cardSchema } from "@/lib/validations/card";

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
    if (parsed.data.imagePath) {
      await supabase.storage.from("card-art").remove([parsed.data.imagePath]);
    }
    return actionError(postgresErrorMessage(error ?? { message: "Création impossible." }));
  }

  try {
    await replaceAbilities(supabase, data.id, parsed.data.abilities);
  } catch {
    await supabase.from("cards").delete().eq("id", data.id);
    if (parsed.data.imagePath) {
      await supabase.storage.from("card-art").remove([parsed.data.imagePath]);
    }
    return actionError("Impossible d’enregistrer les capacités.");
  }

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
      await supabase.storage.from("card-art").remove([parsed.data.imagePath]);
    }
    return actionError(postgresErrorMessage(error));
  }

  try {
    await replaceAbilities(supabase, cardId, parsed.data.abilities);
  } catch {
    return actionError("Impossible d’enregistrer les capacités.");
  }

  if (previousImage && previousImage !== parsed.data.imagePath) {
    await supabase.storage.from("card-art").remove([previousImage]);
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

  if (card.image_path) {
    await supabase.storage.from("card-art").remove([card.image_path]);
  }

  const profile = await getCurrentProfile();
  if (profile) {
    await revalidateCardPaths(profile.username, card.collections.slug ?? "", cardId);
  }

  redirect(`/dashboard/collections/${card.collection_id}`);
}

export async function deleteCardForm(cardId: string): Promise<void> {
  await deleteCardAction(cardId);
}
