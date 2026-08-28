import Link from "next/link";

import { TradingCard, type TradingCardView } from "@/components/cards/trading-card";
import { publicStorageUrl } from "@/lib/env";
import type { CardWithAbilities, PublicCard } from "@/types/models";

function toView(card: CardWithAbilities | PublicCard): TradingCardView {
  return {
    name: card.name,
    kind: card.kind,
    level: card.level,
    shortDescription: card.short_description,
    provider: card.provider,
    imageUrl: publicStorageUrl(card.image_path),
    abilities: [...card.card_abilities]
      .sort((a, b) => a.position - b.position)
      .map((ability) => ({ name: ability.name, power: ability.power })),
  };
}

export function CardGrid({
  cards,
  hrefFor,
}: {
  cards: Array<CardWithAbilities | PublicCard>;
  hrefFor: (card: CardWithAbilities | PublicCard) => string;
}) {
  return (
    <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <li key={card.id} className="flex justify-center">
          <Link href={hrefFor(card)} className="block w-full max-w-[280px] focus-visible:rounded-[18px]">
            <TradingCard card={toView(card)} size="sm" className="mx-auto" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function cardToView(card: CardWithAbilities | PublicCard): TradingCardView {
  return toView(card);
}
