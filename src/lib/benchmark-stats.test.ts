import { describe, expect, it } from "vitest";

import { effortScoresFromLegacy } from "@/lib/benchmark-efforts";
import { averageNormalizedScore, benchmarkCompleteness, selectBestBenchmark } from "@/lib/benchmark-stats";

describe("benchmark-stats", () => {
  it("sélectionne le meilleur score effectif et départage par l’ordre du preset", () => {
    const best = selectBestBenchmark("code", [
      { key: "livecodebench", efforts: effortScoresFromLegacy(80) },
      { key: "swe-bench-pro", efforts: effortScoresFromLegacy(80) },
    ]);
    expect(best?.key).toBe("swe-bench-pro");
    expect(best?.score).toBe(80);
  });

  it("utilise le plus haut effort disponible quand XHigh manque", () => {
    const best = selectBestBenchmark("code", [
      { key: "livecodebench", efforts: { low: 90, medium: null, high: null, xhigh: null } },
      { key: "swe-bench-pro", efforts: { low: 10, medium: 20, high: 30, xhigh: null } },
    ]);
    expect(best?.key).toBe("livecodebench");
    expect(best?.score).toBe(90);
  });

  it("ignore les scores absents dans la moyenne et la complétude", () => {
    expect(averageNormalizedScore("code", [])).toBeNull();
    expect(averageNormalizedScore("code", [{ key: "swe-bench-pro", efforts: effortScoresFromLegacy(50) }])).toBe(50);
    expect(benchmarkCompleteness("code", [{ key: "swe-bench-pro", efforts: effortScoresFromLegacy(50) }])).toEqual({
      filled: 1,
      total: 6,
    });
    expect(
      averageNormalizedScore("code", [
        { key: "swe-bench-pro", efforts: effortScoresFromLegacy(50) },
        { key: "terminal-bench-2-1", efforts: effortScoresFromLegacy(100) },
      ]),
    ).toBe(75);
  });
});
