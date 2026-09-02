import type {
  Card,
  CardAbility,
  CardBenchmark,
  CardModelPricing,
  Collection,
  Profile,
} from "@/types/database";

export type ImageGenerationPreview = {
  id: string;
  prompt: string;
  imagePath: string;
  imageUrl: string;
  createdAt: string;
};

export type CollectionWithOwner = Collection & {
  profiles: Pick<Profile, "username" | "display_name">;
  cards?: { count: number }[];
};

export type CardWithDetails = Card & {
  card_abilities: CardAbility[];
  card_benchmarks: CardBenchmark[];
  card_model_pricing: CardModelPricing | CardModelPricing[] | null;
};

export type CardWithAbilities = CardWithDetails;

export type PublicCard = CardWithDetails & {
  collections: Collection & {
    profiles: Pick<Profile, "username" | "display_name">;
  };
};
