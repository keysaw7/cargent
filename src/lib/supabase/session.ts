import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";

const AUTH_CLAIM_TIMEOUT_MS = 4000;

export function isSupabaseAuthCookie(name: string) {
  return name.startsWith("sb-") && name.includes("auth-token");
}

export function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  for (const { name } of request.cookies.getAll()) {
    if (isSupabaseAuthCookie(name)) {
      response.cookies.delete(name);
    }
  }
}

export async function getAuthClaims(supabase: SupabaseClient<Database>) {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("auth-timeout")), AUTH_CLAIM_TIMEOUT_MS);
  });

  const { data } = await Promise.race([supabase.auth.getClaims(), timeout]);
  return data?.claims ?? null;
}
