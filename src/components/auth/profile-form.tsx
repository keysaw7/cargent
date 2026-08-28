"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import type { Profile } from "@/types/database";

export function ProfileForm({
  profile,
  action,
}: {
  profile: Profile;
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => action(formData),
    null,
  );

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Nom d’utilisateur</Label>
        <Input id="username" value={profile.username} disabled className="h-10" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Nom affiché</Label>
        <Input id="displayName" name="displayName" defaultValue={profile.display_name} required className="h-10" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={profile.bio} />
      </div>
      {state && !state.ok ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "Enregistrement…" : "Enregistrer le profil"}
      </Button>
    </form>
  );
}
