"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import type { Collection } from "@/types/database";

export function CollectionForm({
  collection,
  action,
  submitLabel,
}: {
  collection?: Collection;
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => action(formData),
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom de la collection</Label>
        <Input id="name" name="name" required defaultValue={collection?.name} className="h-10" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={collection?.description} />
      </div>
      <label className="flex items-center justify-between gap-4 rounded-lg border border-gold/20 px-3 py-3">
        <span>
          <span className="block text-sm font-medium">Collection publique</span>
          <span className="text-xs text-muted-foreground">Visible dans l’exploration et sur ton profil.</span>
        </span>
        <input
          type="checkbox"
          name="isPublic"
          defaultChecked={collection?.is_public ?? true}
          className="size-4 accent-gold"
        />
      </label>
      {state && !state.ok ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "Enregistrement…" : submitLabel}
      </Button>
    </form>
  );
}
