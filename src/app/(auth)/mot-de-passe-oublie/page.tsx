import { forgotPasswordAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { PageHeader } from "@/components/layout/page-header";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <PageHeader
        eyebrow="Récupération"
        title="Mot de passe oublié"
        description="Si un compte existe pour cet e-mail, un lien de réinitialisation part."
      />
      <div className="mt-8">
        <AuthForm
          action={forgotPasswordAction}
          submitLabel="Envoyer le lien"
          successMessage="Si un compte existe, le lien est parti. Vérifie ta boîte mail."
          fields={[{ name: "email", label: "E-mail", type: "email", autoComplete: "email" }]}
        />
      </div>
    </main>
  );
}
