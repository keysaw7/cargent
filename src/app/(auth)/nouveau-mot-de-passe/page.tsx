import { updatePasswordAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <PageHeader eyebrow="Sécurité" title="Nouveau mot de passe" description="Choisis un mot de passe d’au moins 8 caractères." />
      <div className="mt-8">
        <AuthForm
          action={updatePasswordAction}
          submitLabel="Enregistrer le mot de passe"
          fields={[
            { name: "password", label: "Nouveau mot de passe", type: "password", autoComplete: "new-password" },
            { name: "confirmPassword", label: "Confirmation", type: "password", autoComplete: "new-password" },
          ]}
        />
      </div>
    </main>
  );
}
