import Link from "next/link";

import { CardGrid } from "@/components/cards/card-grid";
import { TradingCard } from "@/components/cards/trading-card";
import { CollectionCard } from "@/components/collections/collection-card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/queries/auth";
import { listRecentPublicCards } from "@/lib/queries/cards";
import { listRecentPublicCollections } from "@/lib/queries/collections";
import { SPECIMEN_CARD } from "@/lib/specimen";
import type { PublicCard } from "@/types/models";

export default async function HomePage() {
  const [profile, cards, collections] = await Promise.all([
    getCurrentProfile(),
    listRecentPublicCards(6),
    listRecentPublicCollections(4),
  ]);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-gold/20">
        <div className="binder-grid pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-40 lg:block" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="font-mono text-[11px] tracking-[0.32em] text-gold uppercase">Classeur d’IA</p>
            <h1 className="font-display mt-4 max-w-xl text-5xl leading-[0.95] text-ivory sm:text-7xl">
              Les IA méritent mieux qu’une liste
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              Donne un cadre, un niveau et des capacités à un agent ou un modèle. Cargent transforme tes outils en cartes à collectionner, lisibles en un coup d’œil.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-11 px-5">
                <Link href={profile ? "/dashboard" : "/inscription"}>Créer une carte</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 px-5 border-gold/40">
                <Link href="/explorer">Explorer les collections</Link>
              </Button>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="binder-grid absolute inset-6 -z-10 hidden rounded-3xl opacity-50 sm:block" />
            <TradingCard card={SPECIMEN_CARD} size="lg" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl text-ivory">Dernières cartes</h2>
          <Link href="/explorer" className="font-mono text-xs tracking-wider text-gold uppercase">
            Voir l’exploration
          </Link>
        </div>
        {cards.length > 0 ? (
          <CardGrid cards={cards as PublicCard[]} hrefFor={(card) => `/cards/${card.id}`} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucune carte publiée pour l’instant. Atlas t’attend encore dans le spécimen ci-dessus.
          </p>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <h2 className="font-display mb-8 text-3xl text-ivory">Collections récentes</h2>
        {collections.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                href={`/u/${collection.profiles.username}/${collection.slug}`}
                collection={{
                  ...collection,
                  cardCount: collection.cards?.[0]?.count ?? 0,
                  ownerName: collection.profiles.display_name,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Les premiers classeurs apparaîtront ici dès qu’ils seront publics.</p>
        )}
      </section>
    </main>
  );
}
