import type { ModelCategory } from "@/lib/model-benchmarks";
import { MAX_PRICE_USD } from "@/lib/model-benchmarks";
import type { CardModelPricing } from "@/types/database";

export type ModelPricingView =
  | {
      category: "code";
      inputUsdPerMillion: number;
      outputUsdPerMillion: number;
    }
  | {
      category: "image";
      imageUsd: number;
    }
  | {
      category: "video";
      videoSecondUsd: number;
    };

export type CardFormPricing = {
  inputUsdPerMillion: string;
  outputUsdPerMillion: string;
  imageUsd: string;
  videoSecondUsd: string;
};

export type PricingRow = {
  input_usd_per_million_tokens: number | null;
  output_usd_per_million_tokens: number | null;
  image_usd: number | null;
  video_second_usd: number | null;
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export function emptyCardFormPricing(): CardFormPricing {
  return {
    inputUsdPerMillion: "",
    outputUsdPerMillion: "",
    imageUsd: "",
    videoSecondUsd: "",
  };
}

export function asPricingRow(
  value: CardModelPricing | CardModelPricing[] | null | undefined,
): CardModelPricing | null {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > MAX_PRICE_USD) {
    return null;
  }
  return parsed;
}

export function formPricingHasValue(
  pricing: CardFormPricing,
  category: ModelCategory | null,
): boolean {
  if (!category) {
    return false;
  }
  switch (category) {
    case "code":
      return Boolean(pricing.inputUsdPerMillion.trim() || pricing.outputUsdPerMillion.trim());
    case "image":
      return Boolean(pricing.imageUsd.trim());
    case "video":
      return Boolean(pricing.videoSecondUsd.trim());
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
}

export function formPricingToRow(
  category: ModelCategory,
  pricing: CardFormPricing,
): PricingRow | null {
  if (!formPricingHasValue(pricing, category)) {
    return null;
  }

  switch (category) {
    case "code":
      return {
        input_usd_per_million_tokens: parsePrice(pricing.inputUsdPerMillion),
        output_usd_per_million_tokens: parsePrice(pricing.outputUsdPerMillion),
        image_usd: null,
        video_second_usd: null,
      };
    case "image":
      return {
        input_usd_per_million_tokens: null,
        output_usd_per_million_tokens: null,
        image_usd: parsePrice(pricing.imageUsd),
        video_second_usd: null,
      };
    case "video":
      return {
        input_usd_per_million_tokens: null,
        output_usd_per_million_tokens: null,
        image_usd: null,
        video_second_usd: parsePrice(pricing.videoSecondUsd),
      };
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
}

export function rowToFormPricing(row: CardModelPricing | null): CardFormPricing {
  if (!row) {
    return emptyCardFormPricing();
  }
  return {
    inputUsdPerMillion:
      row.input_usd_per_million_tokens === null ? "" : String(row.input_usd_per_million_tokens),
    outputUsdPerMillion:
      row.output_usd_per_million_tokens === null ? "" : String(row.output_usd_per_million_tokens),
    imageUsd: row.image_usd === null ? "" : String(row.image_usd),
    videoSecondUsd: row.video_second_usd === null ? "" : String(row.video_second_usd),
  };
}

export function rowToPricingView(
  category: ModelCategory,
  row: CardModelPricing | null,
): ModelPricingView | null {
  if (!row) {
    return null;
  }

  switch (category) {
    case "code": {
      if (row.input_usd_per_million_tokens === null || row.output_usd_per_million_tokens === null) {
        return null;
      }
      return {
        category,
        inputUsdPerMillion: row.input_usd_per_million_tokens,
        outputUsdPerMillion: row.output_usd_per_million_tokens,
      };
    }
    case "image": {
      if (row.image_usd === null) {
        return null;
      }
      return {
        category,
        imageUsd: row.image_usd,
      };
    }
    case "video": {
      if (row.video_second_usd === null) {
        return null;
      }
      return {
        category,
        videoSecondUsd: row.video_second_usd,
      };
    }
    default: {
      const exhaustive: never = category;
      return exhaustive;
    }
  }
}

export function formPricingToView(
  category: ModelCategory,
  pricing: CardFormPricing,
): ModelPricingView | null {
  const row = formPricingToRow(category, pricing);
  if (!row) {
    return null;
  }
  return rowToPricingView(category, {
    card_id: "",
    created_at: "",
    updated_at: "",
    ...row,
  });
}

export function formatUsd(amount: number): string {
  return usdFormatter.format(amount);
}

function formatUsdCorner(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted}$`;
}

export function formatPricingCompact(pricing: ModelPricingView): string {
  switch (pricing.category) {
    case "code":
      return `IN ${formatUsd(pricing.inputUsdPerMillion)} · OUT ${formatUsd(pricing.outputUsdPerMillion)} / 1M`;
    case "image":
      return `${formatUsd(pricing.imageUsd)} / image`;
    case "video":
      return `${formatUsd(pricing.videoSecondUsd)} / s`;
    default: {
      const exhaustive: never = pricing;
      return exhaustive;
    }
  }
}

export function formatPricingCorner(pricing: ModelPricingView): string {
  switch (pricing.category) {
    case "code":
      return `${formatUsdCorner(pricing.inputUsdPerMillion)}/${formatUsdCorner(pricing.outputUsdPerMillion)}`;
    case "image":
      return `${formatUsdCorner(pricing.imageUsd)}/img`;
    case "video":
      return `${formatUsdCorner(pricing.videoSecondUsd)}/s`;
    default: {
      const exhaustive: never = pricing;
      return exhaustive;
    }
  }
}

export function formatPricingFull(pricing: ModelPricingView): string {
  switch (pricing.category) {
    case "code":
      return `Input ${formatUsd(pricing.inputUsdPerMillion)} / 1M tokens · Output ${formatUsd(pricing.outputUsdPerMillion)} / 1M tokens`;
    case "image":
      return `${formatUsd(pricing.imageUsd)} par image`;
    case "video":
      return `${formatUsd(pricing.videoSecondUsd)} par seconde`;
    default: {
      const exhaustive: never = pricing;
      return exhaustive;
    }
  }
}
