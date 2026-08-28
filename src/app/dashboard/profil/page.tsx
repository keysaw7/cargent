import { updateProfileAction } from "@/actions/auth";
import { ProfileForm } from "@/components/auth/profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentProfile, requireUserId } from "@/lib/queries/auth";
import { notFound } from "next/navigation";

export default async function ProfileSettingsPage() {
  await requireUserId();
  const profile = await getCurrentProfile();
  if (!profile) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <PageHeader eyebrow="Compte" title="Profil" description="Le nom d’utilisateur public ne change pas dans cette version." />
      <ProfileForm profile={profile} action={updateProfileAction} />
    </main>
  );
}
