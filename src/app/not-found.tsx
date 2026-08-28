import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-[11px] tracking-[0.28em] text-gold uppercase">Introuvable</p>
      <h1 className="font-display mt-3 text-4xl text-ivory">Cette carte n’est pas dans le classeur</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        La collection est privée, la carte est encore un brouillon, ou l’adresse est incorrecte.
      </p>
      <Button asChild className="mt-6 h-10 px-4">
        <Link href="/explorer">Retour à l’exploration</Link>
      </Button>
    </main>
  );
}
