import { notFound } from "next/navigation";

import { deleteCollectionForm, updateCollectionAction } from "@/actions/collections";
import { CollectionForm } from "@/components/collections/collection-form";
import { DestructiveForm } from "@/components/layout/destructive-form";
import { PageHeader } from "@/components/layout/page-header";
import { requireUserId } from "@/lib/queries/auth";
import { listCardsForCollection } from "@/lib/queries/cards";
import { getOwnedCollection } from "@/lib/queries/collections";

type Params = Promise<{ id: string }>;

export default async function EditCollectionPage({ params }: { params: Params }) {
  const { id } = await params;
  const userId = await requireUserId();
  const collection = await getOwnedCollection(id, userId);
  if (!collection) {
    notFound();
  }

  const cards = await listCardsForCollection(collection.id, false);
  const updateAction = updateCollectionAction.bind(null, collection.id);
  const deleteAction = deleteCollectionForm.bind(null, collection.id);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <PageHeader
        eyebrow="Collection"
        title="Modifier la collection"
        description="Le slug public se met à jour à partir du nom. La suppression enlève aussi les cartes."
      />
      <div className="mt-8">
        <CollectionForm collection={collection} action={updateAction} submitLabel="Enregistrer" />
      </div>
      <DestructiveForm
        action={deleteAction}
        label="Supprimer la collection"
        hint={`Cette collection contient ${cards.length} carte${cards.length > 1 ? "s" : ""}. La suppression est définitive.`}
      />
    </main>
  );
}
