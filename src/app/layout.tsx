import type { Metadata } from "next";
import { Cormorant_SC, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getSiteUrl } from "@/lib/env";
import { getCurrentProfile } from "@/lib/queries/auth";

import "./globals.css";

const display = Cormorant_SC({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Cargent",
    template: "%s · Cargent",
  },
  description: "Classeur de cartes pour agents et modèles d’IA.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <html
      lang="fr"
      className={`dark ${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader profile={profile} />
        <div id="contenu" className="flex flex-1 flex-col">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
