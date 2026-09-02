import { describe, expect, it } from "vitest";

import {
  buildEffortLineLayout,
  effectiveEffort,
  effortScoresFromLegacy,
  emptyEffortScores,
  firstMonotonicViolation,
  hasAnyEffort,
  presentEfforts,
  xhighScore,
} from "@/lib/benchmark-efforts";
import { getBenchmarkDefinition } from "@/lib/model-benchmarks";

const swe = getBenchmarkDefinition("code", "swe-bench-pro");
if (!swe) {
  throw new Error("Preset code inattendu.");
}

describe("benchmark-efforts", () => {
  it("prend XHigh en priorité puis le plus haut effort disponible", () => {
    expect(effectiveEffort({ low: 10, medium: 20, high: 30, xhigh: 40 })).toEqual({
      level: "xhigh",
      score: 40,
    });
    expect(effectiveEffort({ low: 10, medium: 20, high: 30, xhigh: null })).toEqual({
      level: "high",
      score: 30,
    });
    expect(effectiveEffort({ low: 10, medium: 20, high: null, xhigh: null })).toEqual({
      level: "medium",
      score: 20,
    });
    expect(effectiveEffort({ low: 10, medium: null, high: null, xhigh: null })).toEqual({
      level: "low",
      score: 10,
    });
    expect(effectiveEffort(emptyEffortScores())).toBeNull();
  });

  it("expose seulement XHigh pour l’affichage verso", () => {
    expect(xhighScore({ low: 10, medium: 20, high: 30, xhigh: 40 })).toBe(40);
    expect(xhighScore(effortScoresFromLegacy(80))).toBe(80);
    expect(xhighScore({ low: 10, medium: null, high: null, xhigh: null })).toBeNull();
  });

  it("détecte le premier palier qui casse l’ordre croissant", () => {
    expect(firstMonotonicViolation({ low: 10, medium: 20, high: 30, xhigh: 40 })).toBeNull();
    expect(firstMonotonicViolation({ low: 10, medium: null, high: null, xhigh: 10 })).toBeNull();
    expect(firstMonotonicViolation({ low: 40, medium: 20, high: null, xhigh: null })).toBe("medium");
    expect(firstMonotonicViolation({ low: 10, medium: null, high: 5, xhigh: 40 })).toBe("high");
  });

  it("relie uniquement les efforts renseignés", () => {
    expect(hasAnyEffort(emptyEffortScores())).toBe(false);
    expect(presentEfforts({ low: 10, medium: null, high: 30, xhigh: null })).toEqual([
      { level: "low", score: 10 },
      { level: "high", score: 30 },
    ]);

    const layout = buildEffortLineLayout(swe, { low: 0, medium: null, high: 50, xhigh: 100 }, 160, 36, {
      x: 8,
      y: 8,
    });
    expect(layout.points).toHaveLength(3);
    expect(layout.points[0]?.y).toBeCloseTo(28);
    expect(layout.points.at(-1)?.y).toBeCloseTo(8);
    expect(layout.path.startsWith("M ")).toBe(true);
    expect(layout.path.includes(" L ")).toBe(true);
  });

  it("garde une ligne plate quand toutes les valeurs sont égales", () => {
    const layout = buildEffortLineLayout(swe, { low: 50, medium: 50, high: 50, xhigh: 50 });
    expect(layout.points).toHaveLength(4);
    expect(new Set(layout.points.map((point) => point.y.toFixed(2))).size).toBe(1);
  });
});
