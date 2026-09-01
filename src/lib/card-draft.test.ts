import { describe, expect, it } from "vitest";

import { getCardFormValues, parseDraftAbilities } from "@/lib/card-draft";
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
      image_path: "user/draft.webp",
      generate_prompt: "Un portrait",
      is_published: false,
    } satisfies CardDraft;

    expect(getCardFormValues(card, draft)).toMatchObject({
      name: "Brouillon",
      kind: "model",
      template: "signal",
      generatePrompt: "Un portrait",
      imagePath: "user/draft.webp",
      isPublished: false,
    });
  });
});
