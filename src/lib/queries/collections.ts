import { createClient } from "@/lib/supabase/server";

export async function listOwnerCollections(ownerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*, cards(count)")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []).map((collection) => ({
    ...collection,
    cardCount: collection.cards[0]?.count ?? 0,
  }));
}

export async function getOwnedCollection(collectionId: string, ownerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  return data;
}

export async function getPublicCollectionByUsernameAndSlug(username: string, slug: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (!profile) {
    return null;
  }

  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("owner_id", profile.id)
    .eq("slug", slug)
    .maybeSingle();

  if (!collection) {
    return null;
  }

  return { profile, collection };
}

export async function listRecentPublicCollections(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*, profiles!inner(username, display_name), cards(count)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function listCollectionSlugs(ownerId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("slug").eq("owner_id", ownerId);
  return (data ?? []).map((row) => row.slug);
}
