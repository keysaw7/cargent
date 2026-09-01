import { cache } from "react";
import { redirect } from "next/navigation";

import { getAuthClaims } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const getCurrentUserId = cache(async () => {
  try {
    const supabase = await createClient();
    const claims = await getAuthClaims(supabase);
    return claims?.sub ?? null;
  } catch {
    return null;
  }
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return null;
    }

    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    return data;
  } catch {
    return null;
  }
});

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return data;
}

export async function requireUserId() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/connexion");
  }
  return userId;
}
