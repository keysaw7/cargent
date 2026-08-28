"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-[11px] tracking-[0.28em] text-gold uppercase">Incident</p>
      <h1 className="font-display mt-3 text-4xl text-ivory">La page n’a pas pu s’ouvrir</h1>
      <p className="mt-3 text-sm text-muted-foreground">Réessaie, ou reviens à l’accueil si le problème continue.</p>
      <Button type="button" onClick={reset} className="mt-6 h-10 px-4">
        Réessayer
      </Button>
    </main>
  );
}
