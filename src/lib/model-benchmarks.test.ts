import { describe, expect, it } from "vitest";

import {
  formatBenchmarkScore,
  getBenchmarkPreset,
  isBenchmarkKey,
  isModelCategory,
  MODEL_CATEGORIES,
  MODEL_BENCHMARK_PRESETS,
  modelCategoryLabel,
  normalizeBenchmarkScore,
} from "@/lib/model-benchmarks";

describe("catalogue de benchmarks", () => {
  it("expose trois catégories avec six clés uniques", () => {
    expect(MODEL_CATEGORIES).toEqual(["code", "image", "video"]);
    for (const category of MODEL_CATEGORIES) {
      const preset = getBenchmarkPreset(category);
      expect(preset).toHaveLength(6);
      const keys = preset.map((definition) => definition.key);
      expect(new Set(keys).size).toBe(6);
      for (const definition of preset) {
        expect(definition.shortLabel.length).toBeGreaterThan(0);
        expect(definition.color.startsWith("var(--bench-")).toBe(true);
        expect(definition.domain.max).toBeGreaterThan(definition.domain.min);
      }
    }
  });

  it("reconnaît les catégories et les clés", () => {
    expect(isModelCategory("code")).toBe(true);
    expect(isModelCategory("agent")).toBe(false);
    expect(isBenchmarkKey("code", "swe-bench-pro")).toBe(true);
    expect(isBenchmarkKey("code", "vbench")).toBe(false);
    expect(modelCategoryLabel("video")).toBe("Vidéo");
  });

  it("normalise et formate selon le domaine", () => {
    const briefcase = MODEL_BENCHMARK_PRESETS.code.find((definition) => definition.key === "aa-briefcase");
    const reward = MODEL_BENCHMARK_PRESETS.image.find((definition) => definition.key === "imagereward");
    expect(briefcase).toBeDefined();
    expect(reward).toBeDefined();
    if (!briefcase || !reward) {
      return;
    }
    expect(normalizeBenchmarkScore(briefcase, 500)).toBe(0);
    expect(normalizeBenchmarkScore(briefcase, 2500)).toBe(100);
    expect(normalizeBenchmarkScore(briefcase, 1500)).toBe(50);
    expect(normalizeBenchmarkScore(reward, -2)).toBe(0);
    expect(normalizeBenchmarkScore(reward, 2)).toBe(100);
    expect(formatBenchmarkScore(briefcase, 1747)).toBe("1 747");
  });
});
