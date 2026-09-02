import { describe, expect, it } from "vitest";

import { getCardFormValues, parseDraftAbilities, parseDraftBenchmarks } from "@/lib/card-draft";
import type { CardDraft } from "@/types/database";
import type { CardWithAbilities } from "@/types/models";

describe("parseDraftAbilities", () => {
  it("ignore les capacités invalides et garde une ligne vide", () => {
    expect(parseDraftAbilities("nope")).toEqual([{ name: "", description: "", power: 50 }]);
    expect(
      parseDraftAbilities([
        { name: "Frappe", description: "Un coup.", power: 40 },
        { name: "Trop long".repeat(20), description: "", power: 10 },
      ]),
    ).toEqual([{ name: "Frappe", description: "Un coup.", power: 40 }]);
  });
});

describe("parseDraftBenchmarks", () => {
  it("ignore les lignes corrompues et aligne le preset", () => {
    const parsed = parseDraftBenchmarks(
      [
        { key: "swe-bench-pro", score: 80, version: "2026", sourceUrl: "https://swebench.com/pro", measuredAt: "2026-07-01" },
        { key: "inconnu", score: 10, version: "x", sourceUrl: "https://example.com", measuredAt: "2026-07-01" },
        { name: "pas un benchmark" },
      ],
      "code",
    );
    expect(parsed[0]).toMatchObject({ key: "swe-bench-pro", score: "80" });
    expect(parsed.some((benchmark) => benchmark.key === "inconnu")).toBe(false);
    expect(parsed).toHaveLength(6);
  });

  it("accepte un score sans provenance", () => {
    const parsed = parseDraftBenchmarks(
      [{ key: "swe-bench-pro", score: 80 }],
      "code",
    );
    expect(parsed[0]).toMatchObject({
      key: "swe-bench-pro",
      score: "80",
      version: "",
      sourceUrl: "",
      measuredAt: "",
    });
  });
});

describe("getCardFormValues", () => {
  it("préfère le brouillon à la carte", () => {
    const card = {
      id: "card-1",
      collection_id: "col-1",
      name: "Carte",
      slug: "carte",
      kind: "agent",
      template: "classique",
      provider: "OpenAI",
      level: 6,
      short_description: "Résumé de la carte enregistrée.",
      description: "Desc",
      tags: ["alpha"],
      image_path: "user/card.webp",
      is_published: true,
      created_at: "",
      updated_at: "",
      card_abilities: [{ name: "Ancien", description: "", power: 10, position: 0, id: "a", card_id: "card-1", created_at: "" }],
      card_benchmarks: [],
      card_model_pricing: null,
      model_category: null,
    } as CardWithAbilities;

    const draft = {
      id: "draft-1",
      user_id: "user-1",
      collection_id: "col-1",
      card_id: "card-1",
      created_at: "",
      updated_at: "",
      name: "Brouillon",
      kind: "model",
      template: "signal",
      provider: "Anthropic",
      level: 3,
      short_description: "En cours",
      description: "",
      tags: ["beta"],
      abilities: [{ name: "Nouveau", description: "Effet", power: 20 }],
      model_category: "code",
      benchmarks: [{ key: "swe-bench-pro", score: "70", version: "2026", sourceUrl: "https://swebench.com/pro", measuredAt: "2026-07-01" }],
      pricing: { inputUsdPerMillion: "5", outputUsdPerMillion: "25" },
      image_path: "user/draft.webp",
      generate_prompt: "Un portrait",
      is_published: false,
    } satisfies CardDraft;

    expect(getCardFormValues(card, draft)).toMatchObject({
      name: "Brouillon",
      kind: "model",
      template: "signal",
      modelCategory: "code",
      generatePrompt: "Un portrait",
      imagePath: "user/draft.webp",
      isPublished: false,
    });
    expect(getCardFormValues(card, draft).benchmarks[0]).toMatchObject({
      key: "swe-bench-pro",
      score: "70",
    });
  });
});
