import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="hairline rounded-xl bg-card px-6 py-12 text-center">
      <h2 className="font-display text-3xl text-ivory">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-6 h-10 px-4">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-gold/20 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="font-mono text-[11px] tracking-[0.28em] text-gold uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="font-display mt-2 text-4xl text-ivory sm:text-5xl">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
