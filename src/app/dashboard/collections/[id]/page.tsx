import Link from "next/link";
import { notFound } from "next/navigation";

import { CardGrid } from "@/components/cards/card-grid";
import { EmptyState, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/queries/auth";
import { listCardsForCollection } from "@/lib/queries/cards";
import { getOwnedCollection } from "@/lib/queries/collections";

type Params = Promise<{ id: string }>;

export default async function CollectionDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const userId = await requireUserId();
  const collection = await getOwnedCollection(id, userId);
  if (!collection) {
    notFound();
  }

  const cards = await listCardsForCollection(collection.id, false);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <PageHeader
        eyebrow={collection.is_public ? "Collection publique" : "Collection privée"}
        title={collection.name}
        description={collection.description || "Ajoute des agents et des modèles à ce classeur."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="h-10 px-4">
              <Link href={`/dashboard/collections/${collection.id}/cards/new`}>Nouvelle carte</Link>
            </Button>
            <Button asChild variant="outline" className="h-10 px-4">
              <Link href={`/dashboard/collections/${collection.id}/edit`}>Modifier</Link>
            </Button>
          </div>
        }
      />
      <div className="mt-10">
        {cards.length > 0 ? (
          <CardGrid
            cards={cards}
            hrefFor={(card) => `/dashboard/collections/${collection.id}/cards/${card.id}/edit`}
          />
        ) : (
          <EmptyState
            title="Aucune carte dans ce classeur"
            description="Crée une première carte avec un niveau, une image et des capacités."
            actionHref={`/dashboard/collections/${collection.id}/cards/new`}
            actionLabel="Créer une carte"
          />
        )}
      </div>
    </main>
  );
}
