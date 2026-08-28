import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionCard } from "@/components/collections/collection-card";
import { EmptyState, PageHeader } from "@/components/layout/page-header";
import { getProfileByUsername } from "@/lib/queries/auth";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  return { title: profile ? profile.display_name : "Profil" };
}

export default async function ProfilePage({ params }: { params: Params }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*, cards(count)")
    .eq("owner_id", profile.id)
    .eq("is_public", true)
    .order("updated_at", { ascending: false });

  const collections = data ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <PageHeader
        eyebrow={`@${profile.username}`}
        title={profile.display_name}
        description={profile.bio || "Ce dueliste n’a pas encore rédigé de bio."}
      />
      <div className="mt-10">
        {collections.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                href={`/u/${profile.username}/${collection.slug}`}
                collection={{ ...collection, cardCount: collection.cards[0]?.count ?? 0 }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucune collection publique"
            description="Quand ce compte publiera un classeur, il apparaîtra ici."
          />
        )}
      </div>
    </main>
  );
}
