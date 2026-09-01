import type { SupabaseClient } from "@supabase/supabase-js";

import { CARD_BUCKET } from "@/lib/constants";
import type { Database } from "@/types/database";

export function cardArtIsReferenced(hits: { generation: unknown; draft: unknown; card: unknown }) {
  return Boolean(hits.generation || hits.draft || hits.card);
}

export async function removeCardArtIfUnreferenced(
  supabase: SupabaseClient<Database>,
  path: string | null | undefined,
) {
  if (!path) {
    return;
  }

  const [generation, draft, card] = await Promise.all([
    supabase.from("image_generations").select("id").eq("image_path", path).limit(1).maybeSingle(),
    supabase.from("card_drafts").select("id").eq("image_path", path).limit(1).maybeSingle(),
    supabase.from("cards").select("id").eq("image_path", path).limit(1).maybeSingle(),
  ]);

  if (cardArtIsReferenced({ generation: generation.data, draft: draft.data, card: card.data })) {
    return;
  }

  await supabase.storage.from(CARD_BUCKET).remove([path]);
}

export function uniqueImagePaths(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((path): path is string => Boolean(path)))];
}