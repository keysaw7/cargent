export function slugify(value: string, fallback = "carte"): string {
  const slug = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug.length > 0 ? slug : fallback;
}

export function uniqueSlug(base: string, existing: string[]): string {
  if (!existing.includes(base)) {
    return base;
  }

  let index = 2;
  while (existing.includes(`${base}-${index}`)) {
    index += 1;
  }

  return `${base}-${index}`;
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}
