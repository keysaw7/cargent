import { describe, expect, it } from "vitest";

import { MAX_IMAGE_BYTES } from "@/lib/constants";
import { generatedArtPath, validateGeneratedImageBytes } from "@/lib/storage";

describe("generatedArtPath", () => {
  it("compose un chemin dans le dossier utilisateur", () => {
    expect(
      generatedArtPath("11111111-1111-4111-8111-111111111111", "webp", "22222222-2222-4222-8222-222222222222"),
    ).toBe("11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.webp");
  });

  it("normalise jpeg en jpg", () => {
    expect(generatedArtPath("user-1", "jpeg", "art")).toBe("user-1/art.jpg");
  });

  it("refuse un identifiant de dossier dangereux", () => {
    expect(() => generatedArtPath("../other", "webp")).toThrow("Identifiant utilisateur invalide.");
    expect(() => generatedArtPath("abc/def", "webp")).toThrow("Identifiant utilisateur invalide.");
  });
});

describe("validateGeneratedImageBytes", () => {
  it("accepte un WebP non vide", () => {
    expect(validateGeneratedImageBytes(new Uint8Array([1, 2, 3]), "image/webp")).toBeNull();
  });

  it("refuse un format inconnu", () => {
    expect(validateGeneratedImageBytes(new Uint8Array([1]), "image/gif")).toBe("Le format généré n’est pas pris en charge.");
  });

  it("refuse une image vide", () => {
    expect(validateGeneratedImageBytes(new Uint8Array(), "image/webp")).toBe("L’image générée est vide.");
  });

  it("refuse une image trop lourde", () => {
    expect(validateGeneratedImageBytes(new Uint8Array(MAX_IMAGE_BYTES + 1), "image/webp")).toBe(
      "L’image générée dépasse 5 Mo.",
    );
  });
});
