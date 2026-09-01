export const CARD_BUCKET = "card-art";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export const IMAGE_GENERATION_DAILY_LIMIT = 20;
export const IMAGE_GENERATION_MODEL = "gpt-image-2";
export const IMAGE_GENERATION_SIZE = "1024x768";
export const IMAGE_GENERATION_QUALITY = "low";
export const IMAGE_GENERATION_FORMAT = "webp";
export const IMAGE_GENERATION_HISTORY_LIMIT = 20;
export const CARD_DRAFT_AUTOSAVE_MS = 800;
export const MAX_IMAGE_PROMPT_LENGTH = 800;
export const MAX_ABILITIES = 5;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 12;
export const MIN_CARD_NAME = 2;
export const MAX_CARD_NAME = 48;
export const MAX_PROVIDER = 40;
export const MIN_SHORT_DESCRIPTION = 8;
export const MAX_SHORT_DESCRIPTION = 140;
export const MAX_DESCRIPTION = 2000;
export const MIN_ABILITY_NAME = 2;
export const MAX_ABILITY_NAME = 40;
export const MAX_ABILITY_DESCRIPTION = 180;
export const MIN_ABILITY_POWER = 1;
export const MAX_ABILITY_POWER = 100;
export const MIN_TAG_LENGTH = 2;
export const MAX_TAG_LENGTH = 24;
export const MAX_TAGS = 8;
export const EXPLORE_PAGE_SIZE = 12;
export const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

export type CardKind = "agent" | "model";

export const CARD_TEMPLATES = [
  "classique",
  "signal",
  "reflet",
  "grimoire",
  "terminal",
  "arcane",
  "obsidienne",
  "classeur",
  "relique",
] as const;

export type CardTemplate = (typeof CARD_TEMPLATES)[number];
export const DEFAULT_CARD_TEMPLATE: CardTemplate = "classique";

export function cardKindLabel(kind: CardKind): string {
  switch (kind) {
    case "agent":
      return "Agent";
    case "model":
      return "Modèle";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}
