import { describe, expect, it } from "vitest";

import { effortScoresFromLegacy } from "@/lib/benchmark-efforts";
import { buildRadarLayout } from "@/lib/benchmark-radar";

describe("benchmark-radar", () => {
  it("produit six axes même sans score", () => {
    const layout = buildRadarLayout("code", []);
    expect(layout.points).toHaveLength(6);
    expect(layout.complete).toBe(false);
    expect(layout.polygon).toHaveLength(6);
    expect(layout.points.every((point) => point.normalized === null)).toBe(true);
    expect(layout.points.every((point) => point.x === layout.cx && point.y === layout.cy)).toBe(true);
  });

  it("garde le polygone à six sommets même avec des scores manquants", () => {
    const layout = buildRadarLayout("code", [{ key: "swe-bench-pro", efforts: effortScoresFromLegacy(80) }]);
    expect(layout.complete).toBe(false);
    expect(layout.polygon).toHaveLength(6);
    expect(layout.points.filter((point) => point.normalized !== null)).toHaveLength(1);
    const empty = layout.points.filter((point) => point.normalized === null);
    expect(empty.every((point) => point.x === layout.cx && point.y === layout.cy)).toBe(true);
  });

  it("ferme le polygone quand les six scores effectifs sont présents", () => {
    const layout = buildRadarLayout("code", [
      { key: "swe-bench-pro", efforts: effortScoresFromLegacy(80) },
      { key: "terminal-bench-2-1", efforts: effortScoresFromLegacy(70) },
      { key: "livecodebench", efforts: { low: 40, medium: null, high: 60, xhigh: null } },
      { key: "aider-polyglot", efforts: effortScoresFromLegacy(50) },
      { key: "scicode", efforts: effortScoresFromLegacy(40) },
      { key: "aa-briefcase", efforts: effortScoresFromLegacy(1500) },
    ]);
    expect(layout.complete).toBe(true);
    expect(layout.polygon).toHaveLength(6);
    expect(layout.points.find((point) => point.key === "livecodebench")?.score).toBe(60);
  });
});
