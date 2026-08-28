import { describe, expect, it } from "vitest";

import { normalizeUsername, slugify, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("normalise les accents et les espaces", () => {
    expect(slugify("Clé GPT-4o Mini")).toBe("cle-gpt-4o-mini");
  });

  it("fournit un repli si le nom est vide", () => {
    expect(slugify("***", "carte")).toBe("carte");
  });
});

describe("uniqueSlug", () => {
  it("ajoute un suffixe en cas de collision", () => {
    expect(uniqueSlug("atlas", ["atlas", "atlas-2"])).toBe("atlas-3");
  });
});

describe("normalizeUsername", () => {
  it("conserve uniquement les caractères autorisés", () => {
    expect(normalizeUsername(" Dueliste-01 ")).toBe("dueliste01");
  });
});
