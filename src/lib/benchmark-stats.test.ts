import { describe, expect, it } from "vitest";

import {
  averageNormalizedScore,
  benchmarkCompleteness,
  selectBestBenchmark,
  strengthTierFromNormalized,
} from "@/lib/benchmark-stats";

describe("benchmark-stats", () => {
  it("place les seuils exacts dans le bon palier", () => {
    expect(strengthTierFromNormalized(0)).toBe("Low");
    expect(strengthTierFromNormalized(24.9)).toBe("Low");
    expect(strengthTierFromNormalized(25)).toBe("Medium");
    expect(strengthTierFromNormalized(49.9)).toBe("Medium");
    expect(strengthTierFromNormalized(50)).toBe("High");
    expect(strengthTierFromNormalized(74.9)).toBe("High");
    expect(strengthTierFromNormalized(75)).toBe("XHigh");
    expect(strengthTierFromNormalized(100)).toBe("XHigh");
  });

  it("sélectionne le meilleur score normalisé et départage par l’ordre du preset", () => {
    const best = selectBestBenchmark("code", [
      { key: "livecodebench", score: 80 },
      { key: "swe-bench-pro", score: 80 },
    ]);
    expect(best?.key).toBe("swe-bench-pro");
  });

  it("ignore les scores absents dans la moyenne et la complétude", () => {
    expect(averageNormalizedScore("code", [])).toBeNull();
    expect(averageNormalizedScore("code", [{ key: "swe-bench-pro", score: 50 }])).toBe(50);
    expect(benchmarkCompleteness("code", [{ key: "swe-bench-pro", score: 50 }])).toEqual({
      filled: 1,
      total: 6,
    });
    expect(
      averageNormalizedScore("code", [
        { key: "swe-bench-pro", score: 50 },
        { key: "terminal-bench-2-1", score: 100 },
      ]),
    ).toBe(75);
  });
});
