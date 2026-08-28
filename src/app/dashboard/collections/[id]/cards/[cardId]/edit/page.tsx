import { notFound } from "next/navigation";

import { deleteCardForm, updateCardAction } from "@/actions/cards";
import { CardForm } from "@/components/cards/card-form";
import { DestructiveForm } from "@/components/layout/destructive-form";
import { PageHeader } from "@/components/layout/page-header";
import { requireUserId } from "@/lib/queries/auth";
import { getOwnedCard } from "@/lib/queries/cards";

type Params = Promise<{ id: string; cardId: string }>;

export default async function EditCardPage({ params }: { params: Params }) {
  const { cardId } = await params;
  const userId = await requireUserId();
  const card = await getOwnedCard(cardId, userId);
  if (!card) {
    notFound();
  }

  const updateAction = updateCardAction.bind(null, card.id);
  const deleteAction = deleteCardForm.bind(null, card.id);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <PageHeader eyebrow="Carte" title={`Modifier ${card.name}`} description="Les capacités sont réécrites à chaque enregistrement." />
      <div className="mt-10">
        <CardForm collectionId={card.collection_id} card={card} action={updateAction} submitLabel="Enregistrer la carte" />
      </div>
      <DestructiveForm action={deleteAction} label="Supprimer la carte" />
    </main>
  );
}
