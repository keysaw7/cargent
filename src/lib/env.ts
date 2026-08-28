export function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Variables Supabase manquantes.");
  }

  return { url, publishableKey };
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function publicStorageUrl(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  const { url } = getPublicEnv();
  return `${url}/storage/v1/object/public/card-art/${path}`;
}
