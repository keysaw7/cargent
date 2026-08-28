import type { Metadata } from "next";
import Link from "next/link";

import { CardGrid } from "@/components/cards/card-grid";
import { EmptyState, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EXPLORE_PAGE_SIZE, MAX_LEVEL } from "@/lib/constants";
import { exploreCards } from "@/lib/queries/cards";
import { compactSearch } from "@/lib/search-params";
import type { CardKind } from "@/lib/constants";
import type { PublicCard } from "@/types/models";

type Search = Promise<{
  q?: string;
  kind?: string;
  level?: string;
  sort?: string;
  page?: string;
}>;

export const metadata: Metadata = {
  title: "Explorer",
};

export default async function ExplorerPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const kind = params.kind === "agent" || params.kind === "model" ? (params.kind as CardKind) : undefined;
  const level = params.level ? Number(params.level) : undefined;
  const { cards, total, page } = await exploreCards({
    q: params.q,
    kind,
    level: level && level >= 1 && level <= MAX_LEVEL ? level : undefined,
    sort: params.sort === "level" ? "level" : "recent",
    page: Number(params.page ?? 1),
  });
  const pageCount = Math.max(1, Math.ceil(total / EXPLORE_PAGE_SIZE));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <PageHeader
        eyebrow="Exploration"
        title="Cartes publiques"
        description="Filtre par type, niveau ou nom. Les collections privées et les brouillons restent hors de cette salle."
      />
      <form className="mt-8 grid gap-3 rounded-xl border border-gold/20 bg-card p-4 sm:grid-cols-4">
        <Input name="q" defaultValue={params.q} placeholder="Nom, fournisseur, résumé" className="h-10 sm:col-span-2" />
        <select name="kind" defaultValue={kind ?? ""} className="h-10 rounded-lg border border-input bg-obsidian px-2 text-sm">
          <option value="">Tous les types</option>
          <option value="agent">Agents</option>
          <option value="model">Modèles</option>
        </select>
        <select name="sort" defaultValue={params.sort ?? "recent"} className="h-10 rounded-lg border border-input bg-obsidian px-2 text-sm">
          <option value="recent">Plus récentes</option>
          <option value="level">Niveau</option>
        </select>
        <div className="flex gap-3 sm:col-span-4">
          <Input name="level" type="number" min={1} max={12} defaultValue={params.level} placeholder="Niveau" className="h-10 w-32" />
          <Button type="submit" className="h-10">
            Filtrer
          </Button>
        </div>
      </form>
      <div className="mt-10">
        {cards.length > 0 ? (
          <CardGrid cards={cards as PublicCard[]} hrefFor={(card) => `/cards/${card.id}`} />
        ) : (
          <EmptyState
            title="Aucune carte ne correspond"
            description="Retire un filtre ou élargis la recherche. Les cartes doivent être publiées dans une collection publique."
            actionHref="/explorer"
            actionLabel="Effacer les filtres"
          />
        )}
      </div>
      {pageCount > 1 ? (
        <div className="mt-10 flex justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={compactSearch({ ...params, page: String(page - 1) })}>Précédent</Link>
            </Button>
          ) : null}
          {page < pageCount ? (
            <Button asChild variant="outline">
              <Link href={compactSearch({ ...params, page: String(page + 1) })}>Suivant</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
