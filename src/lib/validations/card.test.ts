import { describe, expect, it } from "vitest";

import { cardSchema } from "@/lib/validations/card";

const validCard = {
  collectionId: "11111111-1111-4111-8111-111111111111",
  name: "Atlas",
  kind: "agent" as const,
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
});
