import { describe, expect, it } from "vitest";

import {
  emptyCardFormPricing,
  formPricingHasValue,
  formPricingToView,
  formatPricingCompact,
  formatUsd,
  rowToPricingView,
} from "@/lib/model-pricing";

describe("model-pricing", () => {
  it("masque une tarification vide", () => {
    expect(formPricingHasValue(emptyCardFormPricing(), "code")).toBe(false);
    expect(formPricingToView("code", emptyCardFormPricing())).toBeNull();
    expect(rowToPricingView("image", null)).toBeNull();
  });

  it("formate les trois catégories en USD", () => {
    expect(
      formatPricingCompact({
        category: "code",
        inputUsdPerMillion: 5,
        outputUsdPerMillion: 25,
      }),
    ).toContain("IN $5.00");
    expect(formatPricingCompact({ category: "image", imageUsd: 0.04 })).toBe("$0.04 / image");
    expect(formatPricingCompact({ category: "video", videoSecondUsd: 0 })).toBe("$0.00 / s");
    expect(formatUsd(0.0125)).toBe("$0.0125");
  });

  it("exige input et output pour le preset code", () => {
    expect(
      formPricingToView("code", {
        ...emptyCardFormPricing(),
        inputUsdPerMillion: "5",
      }),
    ).toBeNull();
    expect(
      formPricingToView("code", {
        ...emptyCardFormPricing(),
        inputUsdPerMillion: "5",
        outputUsdPerMillion: "25",
      }),
    ).toMatchObject({ inputUsdPerMillion: 5, outputUsdPerMillion: 25 });
  });

  it("refuse un prix négatif à la conversion", () => {
    expect(
      formPricingToView("image", {
        ...emptyCardFormPricing(),
        imageUsd: "-2",
      }),
    ).toBeNull();
  });
});
