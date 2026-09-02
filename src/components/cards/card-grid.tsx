import Link from "next/link";

import { FlippableModelCard } from "@/components/cards/flippable-model-card";
import { TradingCard } from "@/components/cards/trading-card";
import { cardToView } from "@/lib/card-view";
import type { CardWithAbilities, PublicCard } from "@/types/models";

export { cardToView };

export function CardGrid({
  cards,
  hrefFor,
}: {
  cards: Array<CardWithAbilities | PublicCard>;
  hrefFor: (card: CardWithAbilities | PublicCard) => string;
}) {
  return (
    <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const view = cardToView(card);
        const href = hrefFor(card);
        return (
          <li key={card.id} className="flex justify-center">
            {card.kind === "model" ? (
              <FlippableModelCard card={view} href={href} />
            ) : (
              <Link href={href} className="block w-full max-w-[280px] focus-visible:rounded-[18px]">
                <TradingCard card={view} size="sm" className="mx-auto" />
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
