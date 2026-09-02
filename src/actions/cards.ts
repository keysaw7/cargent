"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, actionOk, postgresErrorMessage, type ActionResult } from "@/lib/action-result";
import { removeCardArtIfUnreferenced } from "@/lib/card-art";
import type { ModelCategory } from "@/lib/model-benchmarks";
import type { PricingRow } from "@/lib/model-pricing";
import { getCurrentProfile, requireUserId } from "@/lib/queries/auth";
import { getOwnedCard, listCardSlugs } from "@/lib/queries/cards";
import { getOwnedCollection } from "@/lib/queries/collections";
import { slugify, uniqueSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import { cardDraftSchema, cardSchema, type CardInput } from "@/lib/validations/card";
import type { Database } from "@/types/database";

function parseJsonField(value: FormDataEntryValue | null, fallback: unknown): unknown {
  if (value == null || value === "") {
    return fallback;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function parseCardForm(formData: FormData) {
  const abilities = parseJsonField(formData.get("abilities"), []);
  const benchmarks = parseJsonField(formData.get("benchmarks"), []);
  const pricing = parseJsonField(formData.get("pricing"), null);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const modelCategoryValue = String(formData.get("modelCategory") ?? "").trim();

  if (abilities === undefined || benchmarks === undefined || pricing === undefined) {
    return cardSchema.safeParse({ collectionId: "invalid" });
  }

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
    modelCategory: modelCategoryValue || null,
    benchmarks,
    pricing,
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

async function replaceBenchmarks(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cardId: string,
  benchmarks: CardInput["benchmarks"],
) {
  if (benchmarks.length > 0) {
    const { error: upsertError } = await supabase.from("card_benchmarks").upsert(
      benchmarks.map((benchmark) => ({
        card_id: cardId,
        benchmark_key: benchmark.key,
        low_score: benchmark.low ?? null,
        medium_score: benchmark.medium ?? null,
        high_score: benchmark.high ?? null,
        xhigh_score: benchmark.xhigh ?? null,
        benchmark_version: benchmark.version?.trim() || null,
        source_url: benchmark.sourceUrl?.trim() || null,
        measured_at: benchmark.measuredAt?.trim() || null,
      })),
      { onConflict: "card_id,benchmark_key" },
    );
    if (upsertError) {
      throw upsertError;
    }
  }

  const { data: existing, error: listError } = await supabase
    .from("card_benchmarks")
    .select("benchmark_key")
    .eq("card_id", cardId);
  if (listError) {
    throw listError;
  }

  const keep = new Set(benchmarks.map((benchmark) => benchmark.key));
  const extra = (existing ?? [])
    .map((row) => row.benchmark_key)
    .filter((key) => !keep.has(key));
  if (extra.length === 0) {
    return;
  }

  const { error: deleteError } = await supabase
    .from("card_benchmarks")
    .delete()
    .eq("card_id", cardId)
    .in("benchmark_key", extra);
  if (deleteError) {
    throw deleteError;
  }
}

function pricingFromInput(
  category: ModelCategory | null | undefined,
  pricing: CardInput["pricing"],
): PricingRow | null {
  if (!category || !pricing) {
    return null;
  }

  switch (category) {
    case "code":
      if (pricing.inputUsdPerMillion == null && pricing.outputUsdPerMillion == null) {
        return null;
      }
      return {
        input_usd_per_million_tokens: pricing.inputUsdPerMillion ?? null,
        output_usd_per_million_tokens: pricing.outputUsdPerMillion ?? null,
        image_usd: null,
        video_second_usd: null,
      };
    case "image":
      if (pricing.imageUsd == null) {
        return null;
      }
      return {
        input_usd_per_million_tokens: null,
        output_usd_per_million_tokens: null,
        image_usd: pricing.imageUsd,
        video_second_usd: null,
      };
    case "video":
      if (pricing.videoSecondUsd == null) {
        return null;
      }
      return {
        input_usd_per_million_tokens: null,
        output_usd_per_million_tokens: null,
        image_usd: null,
        video_second_usd: pricing.videoSecondUsd,
      };
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
}

async function replacePricing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cardId: string,
  pricing: PricingRow | null,
) {
  if (!pricing) {
    const { error } = await supabase.from("card_model_pricing").delete().eq("card_id", cardId);
    if (error) {
      throw error;
    }
    return;
  }

  const { error } = await supabase.from("card_model_pricing").upsert({
    card_id: cardId,
    ...pricing,
  });
  if (error) {
    throw error;
  }
}

async function clearModelExtras(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cardId: string,
) {
  const { error: benchmarkError } = await supabase.from("card_benchmarks").delete().eq("card_id", cardId);
  if (benchmarkError) {
    throw benchmarkError;
  }
  const { error: pricingError } = await supabase.from("card_model_pricing").delete().eq("card_id", cardId);
  if (pricingError) {
    throw pricingError;
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
  const isModel = parsed.data.kind === "model";

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
      model_category: isModel ? (parsed.data.modelCategory ?? null) : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    await removeCardArtIfUnreferenced(supabase, parsed.data.imagePath);
    return actionError(postgresErrorMessage(error ?? { message: "Création impossible." }));
  }

  try {
    if (isModel) {
      await replaceBenchmarks(supabase, data.id, parsed.data.benchmarks);
      await replacePricing(
        supabase,
        data.id,
        pricingFromInput(parsed.data.modelCategory, parsed.data.pricing),
      );
    } else {
      await replaceAbilities(supabase, data.id, parsed.data.abilities);
    }
  } catch {
    await supabase.from("cards").delete().eq("id", data.id);
    await removeCardArtIfUnreferenced(supabase, parsed.data.imagePath);
    return actionError(
      isModel ? "Impossible d’enregistrer les benchmarks." : "Impossible d’enregistrer les capacités.",
    );
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
  const isModel = parsed.data.kind === "model";

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
      model_category: isModel ? (parsed.data.modelCategory ?? null) : null,
    })
    .eq("id", cardId);

  if (error) {
    if (parsed.data.imagePath && parsed.data.imagePath !== previousImage) {
      await removeCardArtIfUnreferenced(supabase, parsed.data.imagePath);
    }
    return actionError(postgresErrorMessage(error));
  }

  try {
    if (isModel) {
      await replaceBenchmarks(supabase, cardId, parsed.data.benchmarks);
      await replacePricing(
        supabase,
        cardId,
        pricingFromInput(parsed.data.modelCategory, parsed.data.pricing),
      );
      await replaceAbilities(supabase, cardId, []);
    } else {
      await replaceAbilities(supabase, cardId, parsed.data.abilities);
      await clearModelExtras(supabase, cardId);
    }
  } catch {
    return actionError(
      isModel ? "Impossible d’enregistrer les benchmarks." : "Impossible d’enregistrer les capacités.",
    );
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
    model_category: parsed.data.modelCategory ?? null,
    benchmarks: parsed.data.benchmarks,
    pricing: parsed.data.pricing ?? {},
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
