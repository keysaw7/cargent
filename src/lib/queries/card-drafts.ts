import { createClient } from "@/lib/supabase/server";
import type { CardDraft } from "@/types/database";

export async function getCardDraft(
  userId: string,
  collectionId: string,
  cardId?: string,
): Promise<CardDraft | null> {
  const supabase = await createClient();
  let query = supabase.from("card_drafts").select("*").eq("user_id", userId).eq("collection_id", collectionId);

  query = cardId ? query.eq("card_id", cardId) : query.is("card_id", null);

  const { data } = await query.maybeSingle();
  return data;
}