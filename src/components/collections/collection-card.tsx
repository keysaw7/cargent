import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { Collection } from "@/types/database";

type CollectionCardProps = {
  collection: Collection & { cardCount?: number; ownerUsername?: string; ownerName?: string };
  href: string;
};

export function CollectionCard({ collection, href }: CollectionCardProps) {
  return (
    <Link
      href={href}
      className="hairline block rounded-xl bg-card p-5 transition-colors hover:bg-secondary"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl text-ivory">{collection.name}</h3>
        <Badge variant={collection.is_public ? "default" : "secondary"}>
          {collection.is_public ? "Publique" : "Privée"}
        </Badge>
      </div>
      {collection.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{collection.description}</p>
      ) : null}
      <p className="mt-4 font-mono text-xs tracking-wider text-gold uppercase">
        {collection.cardCount ?? 0} carte{(collection.cardCount ?? 0) > 1 ? "s" : ""}
        {collection.ownerName ? ` · ${collection.ownerName}` : ""}
      </p>
    </Link>
  );
}
