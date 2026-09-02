import { describe, expect, it } from "vitest";

import {
  effortDensityForCard,
  radarSizeForBack,
  radarSizeForFrontFooter,
} from "@/lib/card-layout";

describe("card-layout", () => {
  it("mappe le radar du verso à la taille de carte", () => {
    expect(radarSizeForBack("sm")).toBe("sm");
    expect(radarSizeForBack("md")).toBe("md");
    expect(radarSizeForBack("lg")).toBe("lg");
  });

  it("réduit le radar du footer de fiche pour la zone compacte", () => {
    expect(radarSizeForFrontFooter("lg")).toBe("md");
    expect(radarSizeForFrontFooter("md")).toBe("sm");
    expect(radarSizeForFrontFooter("sm")).toBe("sm");
  });

  it("utilise une courbe compacte en sm et une densité card en md/lg", () => {
    expect(effortDensityForCard("sm")).toBe("compact");
    expect(effortDensityForCard("md")).toBe("card");
    expect(effortDensityForCard("lg")).toBe("card");
  });
});
