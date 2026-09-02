export const CARD_SIZES = ["sm", "md", "lg"] as const;
export type CardSize = (typeof CARD_SIZES)[number];

export const CARD_ASPECT_CLASS = "aspect-[59/86]";
export const CARD_IMAGE_ASPECT_CLASS = "aspect-[4/3]";

export const CARD_MAX_WIDTH_PX = {
  sm: 220,
  md: 320,
  lg: 380,
} as const satisfies Record<CardSize, number>;

export const CARD_MAX_WIDTH_CLASS = {
  sm: "max-w-[220px]",
  md: "max-w-[320px]",
  lg: "max-w-[380px]",
} as const satisfies Record<CardSize, string>;

export const CARD_BACK_RADAR_SHARE = "58fr";
export const CARD_BACK_BENCH_SHARE = "42fr";

export const RADAR_VIEWBOX = {
  sm: 168,
  md: 220,
  lg: 280,
} as const satisfies Record<CardSize, number>;

export const RADAR_PADDING = {
  sm: 14,
  md: 34,
  lg: 40,
} as const satisfies Record<CardSize, number>;

export type EffortLineDensity = "compact" | "card" | "detailed";

export function cardFrameClass(size: CardSize) {
  return `${CARD_ASPECT_CLASS} w-full ${CARD_MAX_WIDTH_CLASS[size]}`;
}

export function radarSizeForBack(size: CardSize): CardSize {
  return size;
}

export function radarSizeForFrontFooter(size: CardSize): CardSize {
  switch (size) {
    case "lg":
      return "md";
    case "md":
      return "sm";
    case "sm":
      return "sm";
    default: {
      const exhaustive: never = size;
      return exhaustive;
    }
  }
}

export function effortDensityForCard(size: CardSize): EffortLineDensity {
  switch (size) {
    case "lg":
      return "card";
    case "md":
      return "card";
    case "sm":
      return "compact";
    default: {
      const exhaustive: never = size;
      return exhaustive;
    }
  }
}
