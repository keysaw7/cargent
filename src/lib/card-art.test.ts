import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { cardArtIsReferenced, removeCardArtIfUnreferenced, uniqueImagePaths } from "@/lib/card-art";
import type { Database } from "@/types/database";

function lookupClient(hits: { generation?: boolean; draft?: boolean; card?: boolean }, removed: string[]) {
  const tables: Record<string, boolean> = {
    image_generations: Boolean(hits.generation),
    card_drafts: Boolean(hits.draft),
    cards: Boolean(hits.card),
  };

  return {
    from(table: string) {
      const result = { data: tables[table] ? { id: "1" } : null, error: null };
      const chain = {
        select: () => chain,
        eq: () => chain,
        limit: () => chain,
        maybeSingle: async () => result,
      };
      return chain;
    },
    storage: {
      from: () => ({
        remove: async (paths: string[]) => {
          removed.push(...paths);
          return { data: paths, error: null };
        },
      }),
    },
  } as unknown as SupabaseClient<Database>;
}

describe("cardArtIsReferenced", () => {
  it("détecte une génération, un brouillon ou une carte", () => {
    expect(cardArtIsReferenced({ generation: { id: "1" }, draft: null, card: null })).toBe(true);
    expect(cardArtIsReferenced({ generation: null, draft: { id: "1" }, card: null })).toBe(true);
    expect(cardArtIsReferenced({ generation: null, draft: null, card: { id: "1" } })).toBe(true);
    expect(cardArtIsReferenced({ generation: null, draft: null, card: null })).toBe(false);
  });
});

describe("removeCardArtIfUnreferenced", () => {
  it("ne supprime pas un path encore référencé", async () => {
    const removed: string[] = [];
    await removeCardArtIfUnreferenced(
      lookupClient({ generation: true }, removed),
      "user/art.webp",
    );
    expect(removed).toEqual([]);
  });

  it("supprime un path orphelin", async () => {
    const removed: string[] = [];
    await removeCardArtIfUnreferenced(lookupClient({}, removed), "user/art.webp");
    expect(removed).toEqual(["user/art.webp"]);
  });
});

describe("uniqueImagePaths", () => {
  it("déduplique et ignore les vides", () => {
    expect(uniqueImagePaths(["a.webp", null, "a.webp", "", "b.webp"])).toEqual(["a.webp", "b.webp"]);
  });
});
