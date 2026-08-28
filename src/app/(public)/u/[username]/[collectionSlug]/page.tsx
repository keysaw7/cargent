import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CardGrid } from "@/components/cards/card-grid";
import { EmptyState, PageHeader } from "@/components/layout/page-header";
import { listCardsForCollection } from "@/lib/queries/cards";
import { getPublicCollectionByUsernameAndSlug } from "@/lib/queries/collections";
import { getCurrentUserId } from "@/lib/queries/auth";

type Params = Promise<{ username: string; collectionSlug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username, collectionSlug } = await params;
  const result = await getPublicCollectionByUsernameAndSlug(username, collectionSlug);
  return { title: result?.collection.name ?? "Collection" };
}

export default async function PublicCollectionPage({ params }: { params: Params }) {
  const { username, collectionSlug } = await params;
  const result = await getPublicCollectionByUsernameAndSlug(username, collectionSlug);
  if (!result) {
    notFound();
  }

  const userId = await getCurrentUserId();
  const isOwner = userId === result.collection.owner_id;
  if (!result.collection.is_public && !isOwner) {
    notFound();
  }

  const cards = await listCardsForCollection(result.collection.id, !isOwner);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <PageHeader
        eyebrow={`@${result.profile.username}`}
        title={result.collection.name}
        description={result.collection.description || `Collection de ${result.profile.display_name}.`}
      />
      <div className="mt-10">
        {cards.length > 0 ? (
          <CardGrid cards={cards} hrefFor={(card) => `/cards/${card.id}`} />
        ) : (
          <EmptyState
            title="Classeur encore vide"
            description={
              isOwner
                ? "Ajoute une première carte à cette collection."
                : "Cette collection n’a pas encore de carte publiée."
            }
            actionHref={isOwner ? `/dashboard/collections/${result.collection.id}/cards/new` : undefined}
            actionLabel={isOwner ? "Créer une carte" : undefined}
          />
        )}
      </div>
    </main>
  );
}
