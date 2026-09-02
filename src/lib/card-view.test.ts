import { describe, expect, it } from "vitest";

import { cardToView } from "@/lib/card-view";
import type { CardWithAbilities } from "@/types/models";

describe("cardToView", () => {
  it("trie les benchmarks selon le preset", () => {
    const card = {
      id: "card-1",
      collection_id: "col-1",
      name: "Forge",
      slug: "forge",
      kind: "model",
      template: "signal",
      provider: "Anthropic",
      level: 11,
      short_description: "Modèle de code.",
      description: "",
      tags: [],
      image_path: null,
      is_published: true,
      created_at: "",
      updated_at: "",
      model_category: "code",
      card_abilities: [
        { id: "a", card_id: "card-1", name: "Ancien", description: "", power: 10, position: 0, created_at: "" },
      ],
      card_benchmarks: [
        {
          id: "b2",
          card_id: "card-1",
          benchmark_key: "livecodebench",
          low_score: null,
          medium_score: null,
          high_score: null,
          xhigh_score: 60,
          benchmark_version: "2026",
          source_url: "https://livecodebench.github.io",
          measured_at: "2026-07-01",
          created_at: "",
        },
        {
          id: "b1",
          card_id: "card-1",
          benchmark_key: "swe-bench-pro",
          low_score: 40,
          medium_score: 55,
          high_score: 70,
          xhigh_score: 80,
          benchmark_version: "2026",
          source_url: "https://swebench.com/pro",
          measured_at: "2026-07-01",
          created_at: "",
        },
      ],
      card_model_pricing: {
        card_id: "card-1",
        input_usd_per_million_tokens: 5,
        output_usd_per_million_tokens: 25,
        image_usd: null,
        video_second_usd: null,
        created_at: "",
        updated_at: "",
      },
    } as CardWithAbilities;

    const view = cardToView(card);
    expect(view.modelCategory).toBe("code");
    expect(view.benchmarks?.map((benchmark) => benchmark.key)).toEqual(["swe-bench-pro", "livecodebench"]);
    expect(view.pricing).toMatchObject({ category: "code", inputUsdPerMillion: 5 });
  });

  it("expose un benchmark sans provenance", () => {
    const card = {
      id: "card-1",
      collection_id: "col-1",
      name: "Forge",
      slug: "forge",
      kind: "model",
      template: "signal",
      provider: "Anthropic",
      level: 11,
      short_description: "Modèle de code.",
      description: "",
      tags: [],
      image_path: null,
      is_published: true,
      created_at: "",
      updated_at: "",
      model_category: "code",
      card_abilities: [],
      card_benchmarks: [
        {
          id: "b1",
          card_id: "card-1",
          benchmark_key: "swe-bench-pro",
          low_score: null,
          medium_score: null,
          high_score: null,
          xhigh_score: 80,
          benchmark_version: null,
          source_url: null,
          measured_at: null,
          created_at: "",
        },
      ],
      card_model_pricing: null,
    } as CardWithAbilities;

    expect(cardToView(card).benchmarks).toEqual([
      {
        key: "swe-bench-pro",
        efforts: { low: null, medium: null, high: null, xhigh: 80 },
        version: undefined,
        sourceUrl: undefined,
        measuredAt: undefined,
      },
    ]);
  });
});
