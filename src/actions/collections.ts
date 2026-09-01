"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, postgresErrorMessage, type ActionResult } from "@/lib/action-result";
import { removeCardArtIfUnreferenced, uniqueImagePaths } from "@/lib/card-art";
import { getCurrentProfile, requireUserId } from "@/lib/queries/auth";
import { getOwnedCollection, listCollectionSlugs } from "@/lib/queries/collections";
import { slugify, uniqueSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import { collectionSchema } from "@/lib/validations/collection";

async function revalidateCollectionPaths(username: string, slug?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath(`/u/${username}`);
  if (slug) {
    revalidatePath(`/u/${username}/${slug}`);
  }
}

export async function createCollectionAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const parsed = collectionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    isPublic: formData.get("isPublic") === "on",
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Formulaire incomplet.");
  }

  const userId = await requireUserId();
  const profile = await getCurrentProfile();
  const slugs = await listCollectionSlugs(userId);
  const slug = uniqueSlug(slugify(parsed.data.name, "collection"), slugs);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .insert({
      owner_id: userId,
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? "",
      is_public: parsed.data.isPublic,
    })
    .select("id")
    .single();

  if (error || !data) {
    return actionError(postgresErrorMessage(error ?? { message: "Création impossible." }));
  }

  if (profile) {
    await revalidateCollectionPaths(profile.username, slug);
  }

  redirect(`/dashboard/collections/${data.id}`);
}

export async function updateCollectionAction(
  collectionId: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = collectionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    isPublic: formData.get("isPublic") === "on",
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Formulaire incomplet.");
  }

  const userId = await requireUserId();
  const collection = await getOwnedCollection(collectionId, userId);
  if (!collection) {
    return actionError("Collection introuvable.");
  }

  const profile = await getCurrentProfile();
  const slugs = (await listCollectionSlugs(userId)).filter((slug) => slug !== collection.slug);
  const slug = uniqueSlug(slugify(parsed.data.name, "collection"), slugs);
  const supabase = await createClient();

  const { error } = await supabase
    .from("collections")
    .update({
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? "",
      is_public: parsed.data.isPublic,
    })
    .eq("id", collectionId)
    .eq("owner_id", userId);

  if (error) {
    return actionError(postgresErrorMessage(error));
  }

  if (profile) {
    await revalidateCollectionPaths(profile.username, slug);
    await revalidateCollectionPaths(profile.username, collection.slug);
  }

  redirect(`/dashboard/collections/${collectionId}`);
}

export async function deleteCollectionAction(collectionId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const collection = await getOwnedCollection(collectionId, userId);
  if (!collection) {
    return actionError("Collection introuvable.");
  }

  const supabase = await createClient();
  const [{ data: cards }, { data: drafts }] = await Promise.all([
    supabase.from("cards").select("image_path").eq("collection_id", collectionId),
    supabase.from("card_drafts").select("image_path").eq("collection_id", collectionId),
  ]);

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("owner_id", userId);

  if (error) {
    return actionError("Impossible de supprimer la collection.");
  }

  const paths = uniqueImagePaths([
    ...(cards ?? []).map((card) => card.image_path),
    ...(drafts ?? []).map((draft) => draft.image_path),
  ]);
  await Promise.all(paths.map((path) => removeCardArtIfUnreferenced(supabase, path)));

  const profile = await getCurrentProfile();
  if (profile) {
    await revalidateCollectionPaths(profile.username, collection.slug);
  }

  redirect("/dashboard");
}

export async function deleteCollectionForm(collectionId: string): Promise<void> {
  await deleteCollectionAction(collectionId);
}
