import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cardToView } from "@/components/cards/card-grid";
import { TradingCard } from "@/components/cards/trading-card";
import { Badge } from "@/components/ui/badge";
import { cardKindLabel } from "@/lib/constants";
import { getCardById } from "@/lib/queries/cards";
import type { PublicCard } from "@/types/models";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const card = await getCardById(id);
  if (!card) {
    return { title: "Carte introuvable" };
  }
  return {
    title: card.name,
    description: card.short_description,
  };
}

export default async function CardPage({ params }: { params: Params }) {
  const { id } = await params;
  const card = (await getCardById(id)) as PublicCard | null;
  if (!card) {
    notFound();
  }

  const owner = card.collections.profiles;

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[360px_minmax(0,1fr)]">
      <TradingCard card={cardToView(card)} size="lg" className="mx-auto" />
      <div>
        <p className="font-mono text-[11px] tracking-[0.28em] text-gold uppercase">{cardKindLabel(card.kind)}</p>
        <h1 className="font-display mt-2 text-5xl text-ivory">{card.name}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Niveau {card.level}</Badge>
          {card.provider ? <Badge variant="secondary">{card.provider}</Badge> : null}
          {card.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="mt-6 text-base leading-relaxed text-ivory/90">{card.description || card.short_description}</p>
        <ul className="mt-8 space-y-3">
          {card.card_abilities
            .sort((a, b) => a.position - b.position)
            .map((ability) => (
              <li key={ability.id} className="rounded-lg border border-gold/20 bg-card px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xl">{ability.name}</h2>
                  <span className="font-mono text-sm text-gold">{ability.power}</span>
                </div>
                {ability.description ? <p className="mt-1 text-sm text-muted-foreground">{ability.description}</p> : null}
              </li>
            ))}
        </ul>
        <p className="mt-8 text-sm text-muted-foreground">
          Dans{" "}
          <Link className="text-gold" href={`/u/${owner.username}/${card.collections.slug}`}>
            {card.collections.name}
          </Link>{" "}
          par{" "}
          <Link className="text-gold" href={`/u/${owner.username}`}>
            {owner.display_name}
          </Link>
        </p>
      </div>
    </main>
  );
}
