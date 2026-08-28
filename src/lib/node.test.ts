import { describe, expect, it } from "vitest";

describe("socle projet", () => {
  it("tourne sous Node 24", () => {
    expect(process.versions.node.startsWith("24.")).toBe(true);
  });
});
