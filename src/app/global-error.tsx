"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="fr" className="dark h-full">
      <body className="flex min-h-full flex-col items-center justify-center bg-[#090b14] px-4 text-center text-[#f0e8d5]">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#d6a94a] uppercase">Incident</p>
        <h1 className="mt-3 text-4xl">La page n’a pas pu s’ouvrir</h1>
        <p className="mt-3 max-w-md text-sm text-[#c4b89a]">
          Une session bloquée peut laisser l’écran vide. Réessaie, ou vide les cookies de localhost:3000.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 h-10 rounded-md bg-[#d6a94a] px-4 text-[#090b14]"
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
