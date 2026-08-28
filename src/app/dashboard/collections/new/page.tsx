import { createCollectionAction } from "@/actions/collections";
import { CollectionForm } from "@/components/collections/collection-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewCollectionPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <PageHeader eyebrow="Classeur" title="Nouvelle collection" description="Un nom, une visibilité, et tu pourras y glisser des cartes." />
      <div className="mt-8">
        <CollectionForm action={createCollectionAction} submitLabel="Créer la collection" />
      </div>
    </main>
  );
}
