import Link from "next/link";

import { signUpAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { PageHeader } from "@/components/layout/page-header";

export default function InscriptionPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <PageHeader
        eyebrow="Nouveau dueliste"
        title="Créer un compte"
        description="Un identifiant, un e-mail, un mot de passe. Puis tes cartes."
      />
      <div className="mt-8">
        <AuthForm
          action={signUpAction}
          submitLabel="Créer le compte"
          fields={[
            { name: "username", label: "Nom d’utilisateur", autoComplete: "username", placeholder: "atlas" },
            { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
            { name: "password", label: "Mot de passe", type: "password", autoComplete: "new-password" },
          ]}
        />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="text-gold">
          Connexion
        </Link>
      </p>
    </main>
  );
}
