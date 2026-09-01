import { describe, expect, it } from "vitest";

import { CARD_TEMPLATE_STYLES, isCardTemplate, resolveCardTemplate } from "@/lib/card-templates";
import { CARD_TEMPLATES } from "@/lib/constants";

describe("card templates", () => {
  it("expose un style pour chaque template", () => {
    for (const template of CARD_TEMPLATES) {
      expect(CARD_TEMPLATE_STYLES[template].id).toBe(template);
      expect(CARD_TEMPLATE_STYLES[template].label.length).toBeGreaterThan(0);
    }
  });

  it("reconnaît uniquement les identifiants connus", () => {
    expect(isCardTemplate("relique")).toBe(true);
    expect(isCardTemplate("inconnu")).toBe(false);
    expect(isCardTemplate(null)).toBe(false);
  });

  it("retombe sur classique", () => {
    expect(resolveCardTemplate(undefined)).toBe("classique");
    expect(resolveCardTemplate("signal")).toBe("signal");
  });
});
