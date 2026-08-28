import { EXPLORE_PAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { CardKind } from "@/lib/constants";

export type ExploreFilters = {
  q?: string;
  kind?: CardKind;
  level?: number;
  sort?: "recent" | "level";
  page?: number;
};

const cardSelect = `
  *,
  card_abilities (*),
  collections!inner (
    id,
    name,
    slug,
    is_public,
    owner_id,
    profiles!inner (
      username,
      display_name
    )
  )
`;

export async function listCardsForCollection(collectionId: string, publishedOnly: boolean) {
  const supabase = await createClient();
  let query = supabase
    .from("cards")
    .select("*, card_abilities(*)")
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: false })
    .order("position", { referencedTable: "card_abilities", ascending: true });

  if (publishedOnly) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getCardById(cardId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cards")
    .select(cardSelect)
    .eq("id", cardId)
    .maybeSingle();
  return data;
}

export async function getOwnedCard(cardId: string, ownerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cards")
    .select("*, card_abilities(*), collections!inner(id, owner_id, name, slug)")
    .eq("id", cardId)
    .eq("collections.owner_id", ownerId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const collections = Array.isArray(data.collections) ? data.collections[0] : data.collections;
  if (!collections) {
    return null;
  }

  return { ...data, collections };
}

export async function listCardSlugs(collectionId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("cards").select("slug").eq("collection_id", collectionId);
  return (data ?? []).map((row) => row.slug);
}

export async function listRecentPublicCards(limit = 8) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select(cardSelect)
    .eq("is_published", true)
    .eq("collections.is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function exploreCards(filters: ExploreFilters) {
  const supabase = await createClient();
  const page = Math.max(filters.page ?? 1, 1);
  const from = (page - 1) * EXPLORE_PAGE_SIZE;
  const to = from + EXPLORE_PAGE_SIZE - 1;
  const sort = filters.sort === "level" ? "level" : "created_at";

  let query = supabase
    .from("cards")
    .select(cardSelect, { count: "exact" })
    .eq("is_published", true)
    .eq("collections.is_public", true);

  if (filters.kind) {
    query = query.eq("kind", filters.kind);
  }

  if (filters.level) {
    query = query.eq("level", filters.level);
  }

  if (filters.q && filters.q.trim().length > 0) {
    const term = filters.q.trim();
    query = query.or(`name.ilike.%${term}%,provider.ilike.%${term}%,short_description.ilike.%${term}%`);
  }

  const { data, count, error } = await query.order(sort, { ascending: false }).range(from, to);

  if (error) {
    return { cards: [], total: 0, page };
  }

  return { cards: data ?? [], total: count ?? 0, page };
}
