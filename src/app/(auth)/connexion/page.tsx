import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/actions/auth";
import { PageHeader } from "@/components/layout/page-header";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; notice?: string }>;
}) {
  const { next, notice } = await searchParams;
  const noticeText =
    notice === "confirm"
      ? "Compte créé. Confirme l’e-mail si la confirmation est activée, puis connecte-toi."
      : notice === "lien-invalide"
        ? "Ce lien n’est plus valide. Connecte-toi ou demande un nouveau lien."
        : null;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <PageHeader eyebrow="Accès" title="Connexion" description="Retrouve ton classeur." />
      {noticeText ? <p className="mt-6 text-sm text-gold">{noticeText}</p> : null}
      <div className="mt-8">
        <AuthForm
          action={signInAction}
          submitLabel="Se connecter"
          hiddenFields={next ? { next } : undefined}
          fields={[
            { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
            { name: "password", label: "Mot de passe", type: "password", autoComplete: "current-password" },
          ]}
        />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-gold">
          Créer un compte
        </Link>
        <br />
        <Link href="/mot-de-passe-oublie" className="text-gold">
          Mot de passe oublié
        </Link>
      </p>
    </main>
  );
}
