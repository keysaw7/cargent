import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { recordGeneratedImage } from "@/lib/image-generation";
import { generationFailureStatus, openaiErrorMessage, quotaErrorMessage } from "@/lib/image-generation-errors";
import type { Database } from "@/types/database";

function persistClient(options: { insertOk: boolean; removed: string[] }) {
  return {
    from() {
      return {
        insert: () => ({
          select: () => ({
            single: async () =>
              options.insertOk
                ? { data: { id: "gen-1" }, error: null }
                : { data: null, error: { message: "insert failed" } },
          }),
        }),
      };
    },
    storage: {
      from: () => ({
        remove: async (paths: string[]) => {
          options.removed.push(...paths);
          return { data: paths, error: null };
        },
      }),
    },
  } as unknown as SupabaseClient<Database>;
}

describe("quotaErrorMessage", () => {
  it("mappe un quota dépassé", () => {
    expect(quotaErrorMessage({ message: "quota_exceeded" })).toBe(
      "Tu as atteint la limite de 20 images générées aujourd’hui.",
    );
  });

  it("mappe une session absente", () => {
    expect(quotaErrorMessage({ code: "28000", message: "not_authenticated" })).toBe(
      "Connexion requise pour générer une image.",
    );
  });

  it("laisse passer une erreur inconnue", () => {
    expect(quotaErrorMessage({ message: "deadlock" })).toBeNull();
  });
});

describe("openaiErrorMessage", () => {
  it("signale une erreur générique hors API OpenAI", () => {
    expect(openaiErrorMessage(new Error("boom"))).toBe("Impossible de générer l’image.");
  });
});

describe("generationFailureStatus", () => {
  it("renvoie 429 pour un quota", () => {
    expect(generationFailureStatus("Tu as atteint la limite de 20 images générées aujourd’hui.")).toBe(429);
  });

  it("renvoie 401 pour une session absente", () => {
    expect(generationFailureStatus("Connexion requise pour générer une image.")).toBe(401);
  });

  it("renvoie 503 si la clé manque", () => {
    expect(generationFailureStatus("La génération d’image n’est pas configurée.")).toBe(503);
  });

  it("renvoie 502 pour une erreur provider", () => {
    expect(generationFailureStatus("Impossible de générer l’image.")).toBe(502);
  });
});

describe("recordGeneratedImage", () => {
  const input = {
    userId: "11111111-1111-4111-8111-111111111111",
    prompt: "Portrait d’un agent IA.",
    imagePath: "11111111-1111-4111-8111-111111111111/art.webp",
  };

  it("persiste la génération après un upload réussi", async () => {
    const removed: string[] = [];
    const result = await recordGeneratedImage(persistClient({ insertOk: true, removed }), input);

    expect(result).toEqual({
      ok: true,
      data: { id: "gen-1", imagePath: input.imagePath, prompt: input.prompt },
    });
    expect(removed).toEqual([]);
  });

  it("supprime le fichier si l’insert échoue", async () => {
    const removed: string[] = [];
    const result = await recordGeneratedImage(persistClient({ insertOk: false, removed }), input);

    expect(result.ok).toBe(false);
    expect(removed).toEqual([input.imagePath]);
  });
});
