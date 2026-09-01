import type { Card, CardAbility, Collection, Profile } from "@/types/database";

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

export type CardWithAbilities = Card & {
  card_abilities: CardAbility[];
};

export type PublicCard = Card & {
  card_abilities: CardAbility[];
  collections: Collection & {
    profiles: Pick<Profile, "username" | "display_name">;
  };
};
