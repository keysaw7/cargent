"use server";

import { redirect } from "next/navigation";

import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { getSiteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  newPasswordSchema,
  profileSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Formulaire incomplet.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/dashboard`,
      data: {
        username: parsed.data.username,
        display_name: parsed.data.username,
      },
    },
  });

  if (error) {
    return actionError("Impossible de créer le compte. Réessaie avec un autre e-mail.");
  }

  redirect("/connexion?notice=confirm");
}

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Formulaire incomplet.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return actionError("E-mail ou mot de passe incorrect.");
  }

  const nextPath = String(formData.get("next") ?? "/dashboard");
  redirect(nextPath.startsWith("/") ? nextPath : "/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Indique une adresse e-mail.");
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/nouveau-mot-de-passe`,
  });

  return actionOk();
}

export async function updatePasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Formulaire incomplet.");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return actionError("Le lien de récupération a expiré. Demande-en un nouveau.");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return actionError("Impossible de mettre à jour le mot de passe.");
  }

  redirect("/dashboard");
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Formulaire incomplet.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionError("Connexion requise.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      bio: parsed.data.bio ?? "",
    })
    .eq("id", user.id);

  if (error) {
    return actionError("Impossible d’enregistrer le profil.");
  }

  redirect("/dashboard/profil");
}
