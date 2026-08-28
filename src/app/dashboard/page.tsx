import Link from "next/link";

import { CollectionCard } from "@/components/collections/collection-card";
import { EmptyState, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, requireUserId } from "@/lib/queries/auth";
import { listOwnerCollections } from "@/lib/queries/collections";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const profile = await getCurrentProfile();
  const collections = await listOwnerCollections(userId);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <PageHeader
        eyebrow="Classeur"
        title={profile ? `Chez ${profile.display_name}` : "Ton classeur"}
        description="Tes collections, tes brouillons, tes cartes publiées."
        actions={
          <Button asChild className="h-10 px-4">
            <Link href="/dashboard/collections/new">Nouvelle collection</Link>
          </Button>
        }
      />
      <div className="mt-10">
        {collections.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                href={`/dashboard/collections/${collection.id}`}
                collection={collection}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Ton classeur est vide"
            description="Crée une collection, puis ajoute-y des agents et des modèles."
            actionHref="/dashboard/collections/new"
            actionLabel="Créer une collection"
          />
        )}
      </div>
      <p className="mt-8">
        <Link href="/dashboard/profil" className="text-sm text-gold">
          Modifier le profil
        </Link>
      </p>
    </main>
  );
}
