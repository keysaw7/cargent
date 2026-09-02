import { describe, expect, it } from "vitest";

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
    const layout = buildRadarLayout("code", [{ key: "swe-bench-pro", score: 80 }]);
    expect(layout.complete).toBe(false);
    expect(layout.polygon).toHaveLength(6);
    expect(layout.points.filter((point) => point.normalized !== null)).toHaveLength(1);
    const empty = layout.points.filter((point) => point.normalized === null);
    expect(empty.every((point) => point.x === layout.cx && point.y === layout.cy)).toBe(true);
  });

  it("ferme le polygone quand les six scores sont présents", () => {
    const layout = buildRadarLayout("code", [
      { key: "swe-bench-pro", score: 80 },
      { key: "terminal-bench-2-1", score: 70 },
      { key: "livecodebench", score: 60 },
      { key: "aider-polyglot", score: 50 },
      { key: "scicode", score: 40 },
      { key: "aa-briefcase", score: 1500 },
    ]);
    expect(layout.complete).toBe(true);
    expect(layout.polygon).toHaveLength(6);
  });
});
