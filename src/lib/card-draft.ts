import { resolveCardTemplate } from "@/lib/card-templates";
import { DEFAULT_CARD_TEMPLATE, type CardKind, type CardTemplate } from "@/lib/constants";
import { draftAbilitySchema } from "@/lib/validations/card";
import type { CardDraft, Json } from "@/types/database";
import type { CardWithAbilities } from "@/types/models";

export type CardFormAbility = {
  name: string;
  description: string;
  power: number;
};

export type CardFormValues = {
  name: string;
  kind: CardKind;
  template: CardTemplate;
  provider: string;
  level: number;
  shortDescription: string;
  description: string;
  tags: string;
  abilities: CardFormAbility[];
  imagePath: string | null;
  generatePrompt: string;
  isPublished: boolean;
};

const emptyAbility: CardFormAbility = { name: "", description: "", power: 50 };

export function emptyCardFormValues(): CardFormValues {
  return {
    name: "",
    kind: "agent",
    template: DEFAULT_CARD_TEMPLATE,
    provider: "",
    level: 4,
    shortDescription: "",
    description: "",
    tags: "",
    abilities: [{ ...emptyAbility }],
    imagePath: null,
    generatePrompt: "",
    isPublished: true,
  };
}

export function parseDraftAbilities(value: Json): CardFormAbility[] {
  if (!Array.isArray(value)) {
    return [{ ...emptyAbility }];
  }

  const abilities = value.flatMap((item) => {
    const parsed = draftAbilitySchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });

  return abilities.length > 0 ? abilities : [{ ...emptyAbility }];
}

export function cardToFormValues(card: CardWithAbilities): CardFormValues {
  return {
    name: card.name,
    kind: card.kind,
    template: resolveCardTemplate(card.template),
    provider: card.provider ?? "",
    level: card.level,
    shortDescription: card.short_description,
    description: card.description,
    tags: card.tags.join(", "),
    abilities: card.card_abilities.length
      ? [...card.card_abilities]
          .sort((abilityA, abilityB) => abilityA.position - abilityB.position)
          .map((ability) => ({
            name: ability.name,
            description: ability.description,
            power: ability.power,
          }))
      : [{ ...emptyAbility }],
    imagePath: card.image_path,
    generatePrompt: "",
    isPublished: card.is_published,
  };
}

export function cardDraftToFormValues(draft: CardDraft): CardFormValues {
  return {
    name: draft.name,
    kind: draft.kind,
    template: resolveCardTemplate(draft.template),
    provider: draft.provider,
    level: draft.level,
    shortDescription: draft.short_description,
    description: draft.description,
    tags: draft.tags.join(", "),
    abilities: parseDraftAbilities(draft.abilities),
    imagePath: draft.image_path,
    generatePrompt: draft.generate_prompt,
    isPublished: draft.is_published,
  };
}

export function getCardFormValues(card?: CardWithAbilities, draft?: CardDraft | null): CardFormValues {
  if (draft) {
    return cardDraftToFormValues(draft);
  }

  if (card) {
    return cardToFormValues(card);
  }

  return emptyCardFormValues();
}