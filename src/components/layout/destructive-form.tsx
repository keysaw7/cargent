"use client";

import { Button } from "@/components/ui/button";

export function DestructiveForm({
  action,
  label,
  hint,
}: {
  action: () => Promise<void>;
  label: string;
  hint?: string;
}) {
  return (
    <form action={action} className="mt-10 border-t border-gold/20 pt-6">
      {hint ? <p className="mb-3 text-sm text-muted-foreground">{hint}</p> : null}
      <Button type="submit" variant="destructive">
        {label}
      </Button>
    </form>
  );
}
