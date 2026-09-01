import { describe, expect, it } from "vitest";

import { MAX_IMAGE_PROMPT_LENGTH } from "@/lib/constants";
import { generateImageSchema } from "@/lib/validations/generate-image";

describe("generateImageSchema", () => {
  it("accepte un prompt valide", () => {
    expect(generateImageSchema.parse({ prompt: "Portrait d’un agent IA." }).prompt).toBe("Portrait d’un agent IA.");
  });

  it("refuse un prompt trop court", () => {
    const result = generateImageSchema.safeParse({ prompt: "Court" });
    expect(result.success).toBe(false);
  });

  it("refuse un prompt trop long", () => {
    const result = generateImageSchema.safeParse({ prompt: "a".repeat(MAX_IMAGE_PROMPT_LENGTH + 1) });
    expect(result.success).toBe(false);
  });

  it("normalise les espaces", () => {
    expect(generateImageSchema.parse({ prompt: "  Illustration 4:3 d’un modèle.  " }).prompt).toBe(
      "Illustration 4:3 d’un modèle.",
    );
  });
});
