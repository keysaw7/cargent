import Link from "next/link";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";

export function SiteHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-obsidian/90 backdrop-blur-md">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-gold focus:px-3 focus:py-2 focus:text-obsidian"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-wide text-ivory">Cargent</span>
          <span className="hidden font-mono text-[10px] tracking-[0.24em] text-gold uppercase sm:inline">
            classeur d’IA
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Principal">
          <Button asChild variant="ghost" className="text-ivory">
            <Link href="/explorer">Explorer</Link>
          </Button>
          {profile ? (
            <>
              <Button asChild variant="ghost" className="hidden text-ivory sm:inline-flex">
                <Link href={`/u/${profile.username}`}>Profil</Link>
              </Button>
              <Button asChild variant="outline" className="border-gold/40 text-ivory">
                <Link href="/dashboard">Classeur</Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" className="text-muted-foreground">
                  Déconnexion
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-ivory">
                <Link href="/connexion">Connexion</Link>
              </Button>
              <Button asChild className="h-9 px-3">
                <Link href="/inscription">Créer une carte</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gold/20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-lg text-ivory">Cargent</p>
        <p>Des cartes pour les agents et les modèles, pas une liste de plus.</p>
      </div>
    </footer>
  );
}
