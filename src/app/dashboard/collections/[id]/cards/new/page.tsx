import { notFound } from "next/navigation";

import { createCardAction } from "@/actions/cards";
import { CardForm } from "@/components/cards/card-form";
import { PageHeader } from "@/components/layout/page-header";
import { requireUserId } from "@/lib/queries/auth";
import { getCardDraft } from "@/lib/queries/card-drafts";
import { getOwnedCollection } from "@/lib/queries/collections";
import { listMyImageGenerations } from "@/lib/queries/image-generations";

type Params = Promise<{ id: string }>;

export default async function NewCardPage({ params }: { params: Params }) {
  const { id } = await params;
  const userId = await requireUserId();
  const collection = await getOwnedCollection(id, userId);
  if (!collection) {
    notFound();
  }

  const [draft, generations] = await Promise.all([
    getCardDraft(userId, collection.id),
    listMyImageGenerations(userId),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <PageHeader
        eyebrow={collection.name}
        title="Nouvelle carte"
        description="L’aperçu à droite suit tes champs. Publie seulement quand la carte est prête."
      />
      <div className="mt-10">
        <CardForm
          collectionId={collection.id}
          draft={draft}
          generations={generations}
          action={createCardAction}
          submitLabel="Créer la carte"
        />
      </div>
    </main>
  );
}
