import { describe, expect, it } from "vitest";

import { CARD_TEMPLATES, MAX_ABILITY_NAME, MAX_CARD_NAME, MAX_PROVIDER } from "@/lib/constants";
import { cardDraftSchema, cardSchema } from "@/lib/validations/card";

const validCard = {
  collectionId: "11111111-1111-4111-8111-111111111111",
  name: "Atlas",
  kind: "agent" as const,
  template: "classique" as const,
  provider: "OpenAI",
  level: 7,
  shortDescription: "Agent de recherche documentaire.",
  description: "Parcourt les sources et synthétise.",
  tags: ["recherche"],
  abilities: [{ name: "Synthèse", description: "Résume une source.", power: 80 }],
  imagePath: null,
  isPublished: true,
};

describe("cardSchema", () => {
  it("accepte une carte complète", () => {
    expect(cardSchema.parse(validCard).name).toBe("Atlas");
  });

  it("refuse un niveau hors bornes", () => {
    const result = cardSchema.safeParse({ ...validCard, level: 13 });
    expect(result.success).toBe(false);
  });

  it("refuse plus de cinq capacités", () => {
    const abilities = Array.from({ length: 6 }, (_, index) => ({
      name: `Capacité ${index + 1}`,
      description: "Trop.",
      power: 10,
    }));
    const result = cardSchema.safeParse({ ...validCard, abilities });
    expect(result.success).toBe(false);
  });

  it("utilise classique par défaut si le template est absent", () => {
    expect(cardSchema.parse({ ...validCard, template: undefined }).template).toBe("classique");
  });

  it("accepte les neuf templates connus", () => {
    for (const template of CARD_TEMPLATES) {
      expect(cardSchema.parse({ ...validCard, template }).template).toBe(template);
    }
  });

  it("refuse un template inconnu", () => {
    const result = cardSchema.safeParse({ ...validCard, template: "inconnu" });
    expect(result.success).toBe(false);
  });

  it("refuse un fournisseur trop long avec un message clair", () => {
    const result = cardSchema.safeParse({ ...validCard, provider: "x".repeat(MAX_PROVIDER + 1) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(`Le fournisseur est limité à ${MAX_PROVIDER} caractères.`);
    }
  });

  it("refuse un nom de capacité trop long avec un message clair", () => {
    const result = cardSchema.safeParse({
      ...validCard,
      abilities: [{ name: "x".repeat(MAX_ABILITY_NAME + 1), description: "Effet.", power: 10 }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        `Le nom de la capacité est limité à ${MAX_ABILITY_NAME} caractères.`,
      );
    }
  });
});

describe("cardDraftSchema", () => {
  it("accepte un formulaire incomplet", () => {
    const draft = cardDraftSchema.parse({
      collectionId: validCard.collectionId,
      name: "",
      kind: "agent",
      provider: "",
      level: 4,
      shortDescription: "",
      description: "",
      tags: [],
      abilities: [{ name: "", description: "", power: 50 }],
      generatePrompt: "",
      isPublished: true,
    });
    expect(draft.name).toBe("");
    expect(draft.shortDescription).toBe("");
  });

  it("refuse un nom trop long", () => {
    const result = cardDraftSchema.safeParse({
      collectionId: validCard.collectionId,
      name: "x".repeat(MAX_CARD_NAME + 1),
      kind: "agent",
      provider: "",
      level: 4,
      shortDescription: "",
      description: "",
      tags: [],
      abilities: [],
      generatePrompt: "",
      isPublished: true,
    });
    expect(result.success).toBe(false);
  });
});
